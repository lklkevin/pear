import pytest
import asyncio
from validation import LLMAnswerComparator, Equality


@pytest.mark.parametrize(
    "ans1, ans2, expected",
    [
        ("\\frac{10}{2}", "5", Equality.EQUAL),
        ("7 \\frac{3}{4}", "7.75", Equality.EQUAL),
        ("Interval.open(1, 2)", "(1,2)", Equality.EQUAL),
        ("Point(2,3)", "(2,3)", Equality.EQUAL),
        ("x + x", "2*x", Equality.EQUAL),
        ("{  10, 20 }", "[10,20]", Equality.EQUAL),
        ("(2.000001)", "(2.0)", Equality.EQUAL),
        (
            r"\begin{pmatrix} 1 & 2 \\ 3 & 4 \end{pmatrix}",
            "Matrix([[1,2],[3,4]])",
            Equality.EQUAL,
        ),
        ("The expression is 4.3", "The expression is 2 + 2.3", Equality.EQUAL),
        ("My answer is y=2x+3", "The answer is 2y=4x+6", Equality.EQUAL),
        ("5+3", "10", Equality.UNEQUAL),
        ("sqrt(16)", "5", Equality.UNEQUAL),
        ("3+4j", "3+4j", Equality.EQUAL),
    ],
)
def test_llm_answer_comparator(ans1, ans2, expected):
    comparator = LLMAnswerComparator(tolerance=1e-5)
    result = asyncio.run(comparator.llm_answers_equivalent_full(ans1, ans2)).status
    assert result == expected, f"Failed on: {ans1} vs {ans2}"
