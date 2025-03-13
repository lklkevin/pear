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

celery.conf.update(result_expires=3600)

# Shared async function that handles the core exam generation process
async def _generate_exam_core(self, pdf_data_list, num_questions, title, description, max_parallel=3):
    """
    Core exam generation function used by both generate_exam_task and generate_and_save_exam_task
    Returns the generated exam object and formatted exam data
    """
    exam = Exam()

    # 1. Validate files
    self.update_state(
        state='PROGRESS',
        meta={
            'status': 'Validating PDF files',
            'current': 1,
            'total': 6,
            'stage': 'validation'
        }
    )
    
    if not pdf_data_list or len(pdf_data_list) > 5:
        raise ValueError("Must provide between 1 and 5 PDF files.")

    # 2. Initialize models and scanner
    self.update_state(
        state='PROGRESS',
        meta={
            'status': 'Initializing AI models',
            'current': 2,
            'total': 6,
            'stage': 'initialization'
        }
    )
    
    pdf_model = GeminiModel()
    text_model = Cohere('command-r-plus-08-2024')
    scanner = GeminiPDFScanner(pdf_model, text_model)

    # 3. Scan PDFs
    self.update_state(
        state='PROGRESS',
        meta={
            'status': 'Scanning PDFs and extracting content',
            'current': 3,
            'total': 6,
            'stage': 'pdf_scanning'
        }
    )
    
    extracted_pdfs = await scanner.scan_pdfs(pdf_data_list)

    # 4. Generate questions
    self.update_state(
        state='PROGRESS',
        meta={
            'status': 'Generating potential exam questions',
            'current': 4,
            'total': 6,
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

    # 5. Select questions for the exam
    self.update_state(
        state='PROGRESS',
        meta={
            'status': 'Selecting final exam questions',
            'current': 5,
            'total': 6,
            'stage': 'question_selection'
        }
    )
    
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
            'current': 5.5,  # Show some progress before completion
            'total': 6,
            'stage': 'answer_generation'
        }
    )
    
    # Create a semaphore to limit concurrent tasks
    semaphore = asyncio.Semaphore(max_parallel)

    # Define a function that acquires and releases the semaphore
    async def generate_answers_with_semaphore(question, index, total):
        async with semaphore:
            # This isn't that accurate since its async but oh well
            progress = 5 + ((index + 1) / total)
            self.update_state(
                state='PROGRESS',
                meta={
                    'status': f'Generating answers for question {index + 1}/{total}',
                    'current': progress,
                    'total': 6,
                    'stage': 'answer_generation',
                    'question_progress': {
                        'current': index + 1,
                        'total': total
                    }
                }
            )
            return await answerGenerator.generate_answers(question, 20, text_model)

    # Run answer generation asynchronously for all questions with semaphore
    answer_tasks = [
        generate_answers_with_semaphore(question, i, len(selected_questions)) 
        for i, question in enumerate(selected_questions)
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
    try:
        # Initial progress update
        self.update_state(
            state='PROGRESS',
            meta={
                'status': 'Starting exam generation process',
                'current': 0,
                'total': 6,  # Total number of main steps
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
                'current': 6,
                'total': 6,
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
    try:
        from backend.database.db_factory import get_db_instance
        db = get_db_instance()

        # Initial progress update
        self.update_state(
            state='PROGRESS',
            meta={
                'status': 'Starting exam generation process',
                'current': 0,
                'total': 6,  # Total steps including database save
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
                'current': 6,
                'total': 6,
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