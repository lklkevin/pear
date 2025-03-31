import os
import asyncio
import math
import random
from celery import Celery
from dotenv import load_dotenv

from backend.PdfScanner.GeminiPdfScanner import GeminiPDFScanner
from backend.models import GeminiModel
from backend.models import Cohere
import backend.questionGenerator as questionGenerator
import backend.answerGenerator as answerGenerator
from backend.exam import Exam

load_dotenv()
celery = Celery(
    "task",
    broker=os.environ.get("REDIS_URL"),
    backend=os.environ.get("REDIS_URL"),
    broker_use_ssl={"ssl_cert_reqs": "CERT_NONE"}  # Use CERT_NONE instead of "NONE"
)

celery.conf.update(
    worker_disable_remote_control=True,
    task_soft_time_limit=900,
    result_expires=3600
)

# Shared async function that handles the core exam generation process
async def _generate_exam_core(self, pdf_data_list, num_questions, title, description, max_parallel=5):
    """
    Core function for generating an exam from a list of PDF files.

    This method handles the full pipeline of:
      1. Scanning and extracting content from PDF documents,
      2. Generating potential exam questions based on the extracted content,
      3. Randomly selecting a subset of questions,
      4. Generating multiple answers per question (in parallel with concurrency control),
      5. Formatting the exam data for output.

    Args:
        pdf_data_list (list[bytes]): A list of up to 5 PDF files in byte format.
        num_questions (int): The number of questions to include in the final exam.
        title (str): The title of the exam.
        description (str): A short description of the exam.
        max_parallel (int, optional): Maximum number of concurrent answer generation tasks. Defaults to 5.

    Returns:
        tuple:
            - Exam: An `Exam` object containing the final questions and their answers.
            - dict: A dictionary containing the formatted exam data with title, description, questions, and answers.

    Raises:
        ValueError: If the number of PDFs is not between 1 and 5.
        Exception: If no questions could be generated from the provided PDFs.
    """
    exam = Exam()
    
    if not pdf_data_list or len(pdf_data_list) > 5:
        raise ValueError("Must provide between 1 and 5 PDF files.")
    
    pdf_model = GeminiModel()
    text_model = Cohere('command-a-03-2025')
    scanner = GeminiPDFScanner(pdf_model, text_model)

    # 3. Scan PDFs
    self.update_state(
        state='PROGRESS',
        meta={
            'status': 'Scanning PDFs and extracting content',
            'current': 1,
            'total': 4,
            'stage': 'pdf_scanning'
        }
    )
    
    extracted_pdfs = await scanner.scan_pdfs(pdf_data_list)

    # 4. Generate questions
    self.update_state(
        state='PROGRESS',
        meta={
            'status': 'Generating potential exam questions',
            'current': 2,
            'total': 4,
            'stage': 'question_generation'
        }
    )
    
    possible_exam_questions = []

    for pdf in extracted_pdfs:
        exam_questions = [qa_pair[0] for qa_pair in pdf.qa_pairs]  # Extract only questions
        generated_questions = await questionGenerator.generate_questions(
            exam_questions,
            max(int(math.ceil(num_questions / len(pdf_data_list))), len(exam_questions)),
            text_model
        )
        possible_exam_questions.extend(generated_questions)  # Flattening all generated questions into one list

    if len(possible_exam_questions) == 0:
        raise Exception("No questions could be generated from the provided PDFs")
    
    # Randomly select `num_questions`
    selected_questions = random.sample(possible_exam_questions, min(num_questions, len(possible_exam_questions)))

    # Add questions to the exam
    for question in selected_questions:
        exam.add_question(question)

    # 6. Generate answers for each question
    self.update_state(
        state='PROGRESS',
        meta={
            'status': 'Generating answers for each question',
            'current': 3,  # Show some progress before completion
            'total': 4,
            'stage': 'answer_generation'
        }
    )
    
    # Create a semaphore to limit concurrent tasks
    semaphore = asyncio.Semaphore(max_parallel)

    # Define a function that acquires and releases the semaphore
    async def generate_answers_with_semaphore(question):
        async with semaphore:
            return await answerGenerator.generate_answers(question, 10, text_model)

    # Run answer generation asynchronously for all questions with semaphore
    answer_tasks = [
        generate_answers_with_semaphore(question) 
        for _, question in enumerate(selected_questions)
    ]
    results = await asyncio.gather(*answer_tasks)  # Run all answer generations with controlled parallelism

    # Store answers in the exam
    for question, answers in zip(selected_questions, results):
        exam.add_answers(question, answers)
    
    # Prepare exam data for return
    exam_data = {
        "title": title,
        "description": description,
        "questions": [
            {
                "question": q,
                "answers": exam.get_all_answers(q)
            }
            for q in exam.get_question()
        ]
    }
    
    return exam, exam_data


@celery.task(bind=True)
def generate_exam_task(self, pdf_data_list, num_questions, title, description, max_parallel=3):
    """
    Celery task for generating an exam from uploaded PDFs without saving it to a database.

    This task runs asynchronously and tracks its own progress state across key steps, including:
        1. Initialization,
        2. PDF scanning and content extraction,
        3. Question generation,
        4. Answer generation.

    Args:
        pdf_data_list (list[bytes]): A list of PDF file contents (as bytes).
        num_questions (int): The number of questions to include in the generated exam.
        title (str): The title of the exam.
        description (str): A short description of the exam.
        max_parallel (int, optional): Maximum number of concurrent answer generation tasks. Defaults to 3.

    Returns:
        dict: A dictionary containing the structured exam data (title, description, questions, and answers).

    Raises:
        Exception: If any step in the pipeline fails. Updates the task state to 'FAILURE' and returns error metadata.
    """
    try:
        # Initial progress update
        self.update_state(
            state='PROGRESS',
            meta={
                'status': 'Starting exam generation process',
                'current': 0,
                'total': 4,  # Total number of main steps
                'stage': 'initialization'
            }
        )
        
        # Run the shared async function
        _, exam_data = asyncio.run(_generate_exam_core(self, pdf_data_list, num_questions, title, description, max_parallel))
        
        # Final progress update
        self.update_state(
            state='PROGRESS',
            meta={
                'status': 'Exam generation complete',
                'current': 4,
                'total': 4,
                'stage': 'complete'
            }
        )
        
        return exam_data
    except Exception as e:
        error_data = {
            'exc_type': type(e).__name__,
            'exc_message': str(e)
        }
        self.update_state(state='FAILURE', meta=error_data)
        raise


@celery.task(bind=True)
def generate_and_save_exam_task(self, pdf_data_list, num_questions, title, description, color, privacy, username, max_parallel=3):
    """
    Celery task for generating an exam and saving it to the database under a given user.

    This task performs the same pipeline as `generate_exam_task`, but additionally:
        - Saves the generated exam metadata to the database,
        - Inserts all questions and their associated answers,
        - Associates the exam with a specific user account.

    Args:
        pdf_data_list (list[bytes]): A list of PDF file contents (as bytes).
        num_questions (int): The number of questions to generate.
        title (str): The name/title of the exam.
        description (str): A short description of the exam.
        color (str): Color tag or theme for the exam in the UI.
        privacy (bool): Whether the exam is public (`True`) or private (`False`).
        username (str): The username of the user creating the exam.
        max_parallel (int, optional): Max number of concurrent answer generation tasks. Defaults to 3.

    Returns:
        dict: A dictionary containing the `exam_id` of the saved exam.

    Raises:
        Exception: If an error occurs during exam generation or database insertion.
        Task state is updated to 'FAILURE' with exception type and message.
    """
    try:
        from backend.database.db_factory import get_db_instance
        db = get_db_instance()

        # Initial progress update
        self.update_state(
            state='PROGRESS',
            meta={
                'status': 'Starting exam generation process',
                'current': 0,
                'total': 4,  # Total steps including database save
                'stage': 'initialization'
            }
        )
        
        # Run the shared async function for steps 1-6
        exam, _ = asyncio.run(_generate_exam_core(self, pdf_data_list, num_questions, title, description, max_parallel))
        
        # Step 7: Save to database
        self.update_state(
            state='PROGRESS',
            meta={
                'status': 'Saving exam to database',
                'current': 4,
                'total': 4,
                'stage': 'database_save'
            }
        )

        # Save the exam to the database
        exam_id = db.add_exam(
            username=username,
            name=title,
            color=color,
            description=description,
            public=privacy
        )
        
        # Insert questions and answers into the database
        for index, question_text in enumerate(exam.get_question(), start=1):
            answers = exam.get_all_answers(question_text)
            
            if answers is not None:
                db.insert_question(index, exam_id, question_text, set(answers.items()))
        
        return {"exam_id": exam_id}
        
    except Exception as e:
        error_data = {
            'exc_type': type(e).__name__,
            'exc_message': str(e)
        }
        self.update_state(state='FAILURE', meta=error_data)
        raise
