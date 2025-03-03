from abc import ABC, abstractmethod
from backend.PdfScanner.pdfobject import PDFObject
from backend.models import ModelProvider


class PDFScannerInterface(ABC):
    """
    Abstract base class defining the PDF scanner interface.
    """

    def __init__(self, image_scanner: ModelProvider, text_processor: ModelProvider):
        """
        Initializes the scanner with image scanning and text processing APIs.

        Args:
            image_scanner: API object responsible for extracting text from images.
            text_processor: API object responsible for processing extracted text.
        """
        self.image_scanner = image_scanner
        self.text_processor = text_processor

    @abstractmethod
    def scan_pdfs(self, list_of_pdfs: list[str]) -> list[PDFObject]:
        """
        Scans multiple PDFs and extracts question-answer pairs.

        Args:
            list_of_pdfs (list[str]): List of file paths to PDFs.

        Returns:
            list[PDFObject]: A collection of processed PDF objects.
        """
        pass

    @abstractmethod
    def _process_pdf_text(self, text: str) -> PDFObject:
        """
        Processes the extracted text to generate question-answer pairs.

        Args:
            text (str): The raw extracted text from the PDF.
            include_order (bool): Whether to retain the order of the text.

        Returns:
            PDFObject: Processed text wrapped in a PDFObject.
        """
        pass
