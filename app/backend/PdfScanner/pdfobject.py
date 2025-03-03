class PDFObject:
    """
    A class representing the scanned PDF data.

    Attributes:
        qa_pairs (list[tuple[str, str]]): An ordered list of (question, answer) tuples.
    """

    def __init__(self, qa_pairs: list[tuple[str, str]]):
        self.qa_pairs = qa_pairs

    def __iter__(self):
        """
        Allows iteration over the question-answer pairs.
        """
        return iter(self.qa_pairs)

    def __len__(self) -> int:
        """
        Returns the number of (question, answer) pairs.
        """
        return len(self.qa_pairs)
