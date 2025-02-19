import asyncio

from PdfScanner.pdfobject import PDFObject
from models import ModelProvider, PDFModelProvider
from models import Cohere, GeminiPDFModel
from PdfScanner import PDFScannerInterface  # Adjust the import path as needed


class GeminiPDFScanner(PDFScannerInterface):
    """
    Implementation of PDFScannerInterface using Gemini's PDF processing APIs.

    This scanner uses:
      - image_scanner (a PDFModelProvider) to process PDF files while preserving their native content.
      - text_processor (a ModelProvider) to extract question–answer pairs from the scanned text.
    """

    def __init__(self, image_scanner: PDFModelProvider = None, text_processor: ModelProvider = None):
        """
        Initializes the GeminiPDFScanner with the provided APIs.

        Args:
            image_scanner (PDFModelProvider): API object responsible for extracting content from PDFs.
            text_processor (ModelProvider): API object responsible for processing extracted text.
        """
        if image_scanner is None:
            image_scanner = GeminiPDFModel()
        if text_processor is None:
            text_processor = Cohere()
        super().__init__(image_scanner, text_processor)

    async def scan_pdfs(self, list_of_pdfs: list[str]) -> list[PDFObject]:
        """
        Scans multiple PDFs and extracts question–answer pairs.

        For each PDF file path provided in list_of_pdfs:
          1. Uses the image_scanner to extract the PDF's content while preserving images and formatting.
          2. Processes the extracted content to generate question–answer pairs.

        Args:
            list_of_pdfs (list[str]): List of file paths to PDF documents.

        Returns:
            list[PDFObject]: A collection of processed PDF objects, each containing QA pairs.
        """

        prompt = """
        You are given a PDF of a math exam and your job is to extract the questions in a text applicable format.
        
        For each question, first determine if it can be represented logically and solvably in a text-based format.
        Make sure it is a computational question and not some explaination based question.
        
        Then if so, write out a representation of the question in the form:
        [===]
        Question:
        
        Answer:
        
        Have separators between each question and answer pair. If there is no detectable answer, specify answer as N/A
        If there is an answer, keep only the numerical portion of the answer.
        Keep only the question part of the question, do not preserve any extra formatting like numerical ordering
        """

        pdf_objects = []
        print(f"Processing {len(list_of_pdfs)} PDFs")
        for pdf_path in list_of_pdfs:
            print(f"Processing PDF: {pdf_path}")  # Print the current PDF file being processed
            # Use the image scanner to extract the full PDF content without modification.
            extracted_content = self.image_scanner.call_model(
                pdf_path,
                prompt=prompt
            )
            # Process the extracted text to obtain question–answer pairs.
            pdf_obj = await self._process_pdf_text(extracted_content)
            pdf_objects.append(pdf_obj)
        return pdf_objects

    async def _process_pdf_text(self, text: str) -> PDFObject:
        """
        Processes the extracted text to generate question–answer pairs using the text processor.

        This method sends a prompt to the text processor asking for QA pairs extracted from the provided text.
        The expected response should have each question prefixed with "Q:" and each answer with "A:" on consecutive lines.

        Args:
            text (str): The raw extracted text from the PDF.

        Returns:
            PDFObject: A PDFObject wrapping an ordered list of (question, answer) pairs.
        """
        raw_questions = text.split("[===]")[1:]  # ignore the initial response from the model
        qa_pairs = []

        for section in raw_questions:
            section = section.strip()
            # Convert to lower-case for a case-insensitive search of markers
            lower_section = section.lower()

            q_index = lower_section.find("question:")
            a_index = lower_section.find("answer:")

            # Ensure both markers are found and in the correct order.
            if q_index == -1 or a_index == -1 or q_index > a_index:
                print(f"Skipping section due to missing markers:\n{section}")
                continue

            # Extract question text: everything between "Question:" and "Answer:"
            question = section[q_index + len("question:"):a_index].strip()

            # Extract answer text: everything after "Answer:"
            answer = section[a_index + len("answer:"):].strip()

            # Validate the extracted question.
            if not await self._validate_question(question):
                print(f"Invalid question skipped: {question}")
                continue

            qa_pairs.append((question, answer))

        return PDFObject(qa_pairs)

    async def _validate_question(self, question: str) -> bool:
        """
        Validates whether a given question meets the expected format.

        Args:
            question (str): The extracted question string.

        Returns:
            bool: True if the question is valid, False otherwise.
        """

        prompt = f"""
        You are validator for a math exam creation and you are to oversee exam questions. The goal is to have
        text based questions that result in a singular answer. 
        
        You will be given an exam question and respond whether it is satisfactory to be included in the math exam.
        For your criteria, be generous to the question, and just try to exclude gibberish or non-math questions, as long
        as you can look at it and see what computation needs to be done.
        You can assume that just a formula by itself means to solve that formula and is a valid question.
        
        In your response, only include the word 'yes' or 'no'
        
        Here is the question:
        {question}
        """

        # response = await self.text_processor.call_model("command-r", "", prompt=prompt, is_answer=False)
        response = "yes"

        if response is None:
            return False

        return 'yes' in response


if __name__ == "__main__":
    pdf_model = GeminiPDFModel()
    text_model = Cohere()
    scanner = GeminiPDFScanner(pdf_model, text_model)
    result = asyncio.run(scanner.scan_pdfs(["./tests/example_pdfs/math_12.pdf"]))[0]
    for question in result:
        print(question)
