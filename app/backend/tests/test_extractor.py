import os
import pytest
import asyncio
from backend.PdfScanner.GeminiPdfScanner import GeminiPDFScanner
from io import BytesIO
from werkzeug.datastructures import FileStorage

# Instantiate the PDF scanner model
model = GeminiPDFScanner()

# Get the current directory for file location resolution
curr_dir = os.path.dirname(os.path.abspath(__file__))


def load_pdf(pdf: str):
    """
    Helper function to simulate a Flask file upload and return the PDF binary content.

    Parameters:
    - pdf (str): The base name of the PDF file (without extension) located in 'example_pdfs/'.

    Returns:
    - bytes: The binary content of the PDF.
    """
    filepath = f"example_pdfs/{pdf}.pdf"
    file_path = os.path.join(curr_dir, filepath)
    with open(file_path, "rb") as pdf_file:
        pdf_bytes = pdf_file.read()

    # Create an in-memory file-like object and wrap it as a Flask FileStorage object.
    pdf_stream = BytesIO(pdf_bytes)
    file = FileStorage(
        stream=pdf_stream,
        filename="test.pdf",
        content_type="application/pdf"
    )
    return file.read()


@pytest.mark.parametrize("pdf_filename, expected_count, description", [
    ("empty", 0, "Empty PDF should yield no questions."),
    ("images", 5, "PDF with images should extract questions even with embedded images."),
    ("inconsistent", 5, "PDF with inconsistent formatting should still extract the questions."),
    ("multi_column", 5, "Multi-column PDF should correctly extract questions from each column."),
    ("noisy", 5, "Noisy PDF should extract questions while filtering out non-question content."),
    ("normal1", 5, "Standard exam PDF (normal1) should yield the expected number of questions."),
    ("normal2", 5, "Standard exam PDF (normal2) should yield the expected number of questions."),
    ("normal3", 5, "Standard exam PDF (normal2) should yield the expected number of questions."),
    ("unrelated", 3, "PDF unrelated to exams should still yield some questions."),
])
def test_pdf_extraction(pdf_filename, expected_count, description):
    """
    Test that the PDF question extractor correctly extracts the expected number of questions
    from various PDF inputs.

    Parameters:
    - pdf_filename (str): The base filename (without .pdf extension) to load.
    - expected_count (int): The expected number of questions extracted from the PDF.
    - description (str): A description of the test scenario.
    """
    # Load the PDF content using our helper function.
    pdf_data = load_pdf(pdf_filename)

    # Run the extraction process (assuming scan_pdfs takes a list of PDF contents and returns a list of results).
    results = asyncio.run(model.scan_pdfs([pdf_data], validate=False))

    # Extract the questions from the first (and only) result.
    questions = results[0]

    # Assert that the number of extracted questions equals the expected count.
    assert len(questions) >= expected_count, (
        f"{description} Expected {expected_count} questions, but got {len(questions)}."
    )
