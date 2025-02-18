from pdfobject import PDFObject
from app.backend.models import ModelProvider, PDFModelProvider
from app.backend.PdfScanner import PDFScannerInterface  # Adjust the import path as needed


class GeminiPDFScanner(PDFScannerInterface):
    """
    Implementation of PDFScannerInterface using Gemini's PDF processing APIs.

    This scanner uses:
      - image_scanner (a PDFModelProvider) to process PDF files while preserving their native content.
      - text_processor (a ModelProvider) to extract question–answer pairs from the scanned text.
    """

    def __init__(self, image_scanner: PDFModelProvider, text_processor: ModelProvider):
        """
        Initializes the GeminiPDFScanner with the provided APIs.

        Args:
            image_scanner (PDFModelProvider): API object responsible for extracting content from PDFs.
            text_processor (ModelProvider): API object responsible for processing extracted text.
        """
        super().__init__(image_scanner, text_processor)

    def scan_pdfs(self, list_of_pdfs: list[str]) -> list[PDFObject]:
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
        pdf_objects = []
        for pdf_path in list_of_pdfs:
            # Use the image scanner to extract the full PDF content without modification.
            extracted_content = self.image_scanner.call_model(
                pdf_path,
                prompt="Extract the full content of the PDF, preserving images and text."
            )
            # Process the extracted text to obtain question–answer pairs.
            pdf_obj = self._process_pdf_text(extracted_content, include_order=True)
            pdf_objects.append(pdf_obj)
        return pdf_objects

    def _process_pdf_text(self, text: str, include_order: bool) -> PDFObject:
        """
        Processes the extracted text to generate question–answer pairs using the text processor.

        This method sends a prompt to the text processor asking for QA pairs extracted from the provided text.
        The expected response should have each question prefixed with "Q:" and each answer with "A:" on consecutive lines.

        Args:
            text (str): The raw extracted text from the PDF.
            include_order (bool): Whether to retain the order of the extracted content in the QA pairs.

        Returns:
            PDFObject: A PDFObject wrapping an ordered list of (question, answer) pairs.
        """
        order_instruction = "in the order they appear" if include_order else ""
        prompt = (
                f"Extract question and answer pairs from the following text {order_instruction}. "
                "Format your response so that each question is prefixed with 'Q:' and each answer with 'A:'. "
                "Each pair should be on consecutive lines. Here is the text:\n\n" + text
        )

        response_text = self.text_processor.call_model(prompt=prompt)

        # Parse the response text into (question, answer) pairs.
        qa_pairs = []
        current_question = None
        for line in response_text.splitlines():
            line = line.strip()
            if line.startswith("Q:"):
                current_question = line[2:].strip()
            elif line.startswith("A:") and current_question is not None:
                answer = line[2:].strip()
                qa_pairs.append((current_question, answer))
                current_question = None

        return PDFObject(qa_pairs)
