import asyncio
import math
import random


from backend.PdfScanner.GeminiPdfScanner import GeminiPDFScanner
from backend.models import GeminiModel
from backend.models import Cohere
import backend.questionGenerator as questionGenerator
import backend.answerGenerator as answerGenerator
from backend.exam import Exam


async def generate_exam_from_pdfs(files, num_questions, max_parallel=3):
    """
    Processes up to 5 PDF files, extracts text, and generates an AI-created exam.

    Args:
        files (list): List of uploaded PDF files.
        num_questions (int): The number of questions to add to the exam
        max_parallel (int): Maximum number of parallel requests allowed

    Returns:
        dict: Generated exam with questions and possible answers.
    """
    exam = Exam()

    if not files or len(files) > 5:
        raise ValueError("Must provide between 1 and 5 PDF files.")

    pdf_model = GeminiModel()
    text_model = Cohere('command-a-08-2025')
    scanner = GeminiPDFScanner(pdf_model, text_model)

    pdf_data_list = [bytes for bytes in files]
    extracted_pdfs = await scanner.scan_pdfs(pdf_data_list)

    possible_exam_questions = []

    for pdf in extracted_pdfs:
        print("Generating Questions from Exam")
        exam_questions = [qa_pair[0] for qa_pair in pdf.qa_pairs]  # Extract only questions
        generated_questions = await questionGenerator.generate_questions(exam_questions,
                                                                        max(int(math.ceil(num_questions / len(files))),
                                                                            len(exam_questions)),
                                                                        text_model)
        possible_exam_questions.extend(generated_questions)  # Flattening all generated questions into one list


    if len(possible_exam_questions) == 0:
        raise Exception("No questions could be generated from the provided PDFs")

    # Randomly select `num_questions`
    print(f"Randomly selecting subset of {num_questions} questions")
    selected_questions = random.sample(possible_exam_questions, num_questions)

    # Add questions to the exam
    for question in selected_questions:
        exam.add_question(question)

    # Create a semaphore to limit concurrent tasks
    semaphore = asyncio.Semaphore(max_parallel)

    # Define a function that acquires and releases the semaphore
    async def generate_answers_with_semaphore(question):
        async with semaphore:
            return await answerGenerator.generate_answers(question, 20, text_model)

    # Run answer generation asynchronously for all questions with semaphore
    print(f"Running AI Answer Generation for Each Question (max {max_parallel} in parallel)")
    answer_tasks = [generate_answers_with_semaphore(question) for question in selected_questions]
    results = await asyncio.gather(*answer_tasks)  # Run all answer generations with controlled parallelism

    # Store answers in the exam
    for question, answers in zip(selected_questions, results):
        exam.add_answers(question, answers)

    return exam  # Return the completed Exam object

if __name__ == "__main__":
    from io import BytesIO
    from werkzeug.datastructures import FileStorage

    # Simulate a Flask file upload
    with open("./backend/tests/example_pdfs/math_12.pdf", "rb") as pdf_file:
        pdf_bytes = pdf_file.read()  # Read the binary content

    # Create an in-memory file-like object
    pdf_stream = BytesIO(pdf_bytes)

    # Wrap it as a Flask FileStorage object (simulating an uploaded file)
    file = FileStorage(
        stream=pdf_stream,
        filename="test.pdf",
        content_type="application/pdf"
    )

    num_questions = 5
    # Pass FileStorage content to scan_pdfs()
    exam = asyncio.run(generate_exam_from_pdfs([file.read()], num_questions))

    # Print exam
    exam.display_exam()
