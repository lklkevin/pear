import pytest
import asyncio
from backend.PdfScanner.GeminiPdfScanner import GeminiPDFScanner

model = GeminiPDFScanner()


@pytest.mark.parametrize(
    "question, expected",
    [
        # Basic valid math questions
        ("What is the derivative of x^2?", True),
        ("Solve for x: 2x + 3 = 7", True),
        ("What is the integral of sin(x) dx?", True),
        ("Find the determinant of the matrix [[1,2],[3,4]].", True),
        ("2x+3=7", True),

        # Geometry and coordinate plane
        ("If the point A has coordinates (-4, 2) and the point C has coordinates (5, 14), then the distance from A to C in the xy-plane is", True),

        # Variation and inverse relationships
        ("y varies inversely as the square root of x. When x = 25, y = 4. What is the value of y when x = 100?", True),

        # Function composition and calculus
        ("If f(x) = (2x+6) / (x+2) , then f(a+2) =", True),
        ("If g(x) = x^2 -2 and f(x) = 4x+2 and if g o f indicates the composition of g with f, then (g o f)(1) =", True),
        ("If f(x) = 1/x and h≠ 0, then (f(x+h) − f(x)) / h =", True),

        # Edge cases (valid but slightly ambiguous)
        ("Is 0 a prime number?", True),
        ("What is the limit of (1/n) as n approaches infinity?", True),
        ("Is pi a rational number?", True),

        # Invalid or non-mathematical inputs
        ("Hello, how are you?", False),
        ("Tell me a joke about calculus.", False),
        ("", False),  # Empty input should be invalid
        ("Explain quantum mechanics.", False),  # Not strictly a math question

        # Poorly formatted or unclear math questions
        ("What?", False),  # Too vague to be a valid question
    ]
)
def test_extraction_validator(question: str, expected: bool):
    result = asyncio.run(model.validate_question(question))
    assert result == expected, f"Incorrect label for question: {question}"
