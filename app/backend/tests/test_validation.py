import pytest
import asyncio
from backend.validation import LLMAnswerComparator, Equality


@pytest.mark.parametrize(
    "ans1, ans2, expected_status, expected_state",
    [
        # Test case where string comparison fails but symbolic comparison succeeds
        (
            "\\frac{10}{2}",
            "5",
            Equality.EQUAL,
            [
                {"type": "string comparison", "reason": "not equal"},
                {"type": "math comparison", "reason": "failed"},
                {"type": "brackets comparison", "reason": "failed"},
                {"type": "matrices comparison", "reason": "failed"},
                {"type": "symbolic comparison", "reason": "success"},
            ],
        ),
        # Test case where string comparison fails but symbolic comparison succeeds
        (
            "7 \\frac{3}{4}",
            "7.75",
            Equality.EQUAL,
            [
                {"type": "string comparison", "reason": "not equal"},
                {"type": "math comparison", "reason": "failed"},
                {"type": "brackets comparison", "reason": "failed"},
                {"type": "matrices comparison", "reason": "failed"},
                {"type": "symbolic comparison", "reason": "success"},
            ],
        ),
        # Test case where string comparison fails but symbolic comparison succeeds
        (
            "Interval.open(1, 2)",
            "(1,2)",
            Equality.EQUAL,
            [
                {"type": "string comparison", "reason": "not equal"},
                {"type": "math comparison", "reason": "failed"},
                {"type": "brackets comparison", "reason": "success"},
            ],
        ),
        # Test case where string comparison fails but matrices comparison succeeds
        (
            r"\begin{pmatrix} 1 & 2 \\ 3 & 4 \end{pmatrix}",
            "Matrix([[1,2],[3,4]])",
            Equality.EQUAL,
            [
                {"type": "string comparison", "reason": "not equal"},
                {"type": "math comparison", "reason": "failed"},
                {"type": "brackets comparison", "reason": "failed"},
                {"type": "matrices comparison", "reason": "success"},
            ],
        ),
        # Test case where symbolic comparison succeeds without LLM
        (
            "x + x",
            "2*x",
            Equality.EQUAL,
            [
                {"type": "string comparison", "reason": "not equal"},
                {"type": "math comparison", "reason": "failed"},
                {"type": "brackets comparison", "reason": "failed"},
                {"type": "matrices comparison", "reason": "failed"},
                {"type": "symbolic comparison", "reason": "success"},
            ],
        ),
        # Test case where string comparison fails but brackets comparison succeeds
        (
            "{  10, 20 }",
            "[10,20]",
            Equality.EQUAL,
            [
                {"type": "string comparison", "reason": "not equal"},
                {"type": "math comparison", "reason": "failed"},
                {"type": "brackets comparison", "reason": "success"},
            ],
        ),
        # Test case where string comparison fails but math comparison succeeds
        (
            "2.000001",
            "2.0",
            Equality.EQUAL,
            [
                {"type": "string comparison", "reason": "not equal"},
                {"type": "math comparison", "reason": "success"},
            ],
        ),
        # Test case where all non-LLM checks fail, requiring LLM verification
        (
            "sqrt(25)",
            "5",
            Equality.EQUAL,
            [
                {"type": "string comparison", "reason": "not equal"},
                {"type": "math comparison", "reason": "failed"},
                {"type": "brackets comparison", "reason": "failed"},
                {"type": "matrices comparison", "reason": "failed"},
                {"type": "symbolic comparison", "reason": "success"},
            ],
        ),
        # Test case where string comparison succeeds immediately
        (
            "3+4j",
            "3+4j",
            Equality.EQUAL,
            [{"type": "string comparison", "reason": "success"}],
        ),
        (
            "3",
            "3.01",
            Equality.UNEQUAL,
            [
                {"type": "string comparison", "reason": "not equal"},
                {"type": "math comparison", "reason": "not equal"},
            ],
        ),
        (
            "The expression is 4.3",
            "The expression is 2 + 2.3",
            Equality.EQUAL,
            [
                {"type": "string comparison", "reason": "not equal"},
                {"type": "math comparison", "reason": "failed"},
                {"type": "brackets comparison", "reason": "failed"},
                {"type": "matrices comparison", "reason": "failed"},
                {"type": "symbolic comparison", "reason": "failed"},
                {"type": "llm comparison", "reason": "success"},
            ],
        ),
        (
            "The expression is 4.3",
            "The expression is 2 + 2.1",
            Equality.UNEQUAL,
            [
                {"type": "string comparison", "reason": "not equal"},
                {"type": "math comparison", "reason": "failed"},
                {"type": "brackets comparison", "reason": "failed"},
                {"type": "matrices comparison", "reason": "failed"},
                {"type": "symbolic comparison", "reason": "failed"},
                {"type": "llm comparison", "reason": "not equal"},
            ],
        ),
    ],
)
def test_llm_answer_comparator(ans1, ans2, expected_status, expected_state):
    comparator = LLMAnswerComparator(tolerance=1e-5)
    validation_obj = asyncio.run(comparator.llm_answers_equivalent_full(ans1, ans2))

    assert (
        validation_obj.status == expected_status
    ), f"Status mismatch for: {ans1} vs {ans2}"
    assert (
        validation_obj.state == expected_state
    ), f"State mismatch for: {ans1} vs {ans2}, got {validation_obj.state}"


# @pytest.mark.parametrize(
#     "ans1, ans2, expected",
#     [
#         ("The expression is 4.3", "The expression is 2 + 2.3", Equality.EQUAL),
#         ("2 hours and 4 minutes", "124 minutes", Equality.EQUAL),
#     ],
# )

# def test_llm_answer_comparator(ans1, ans2, expected):
#     comparator = LLMAnswerComparator(tolerance=1e-5)
#     result = asyncio.run(comparator.llm_answers_equivalent_full(ans1, ans2)).status
#     assert result == expected, f"Failed on: {ans1} vs {ans2}"
