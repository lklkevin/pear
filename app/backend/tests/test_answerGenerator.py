import pytest
import pytest_asyncio
from backend.answerGenerator import extract_answer, majority_vote, generate_answers
from backend.models import Cohere
from backend.validation import LLMAnswerComparator, Equality
from unittest.mock import patch, AsyncMock

# Configure pytest-asyncio
pytest_plugins = ('pytest_asyncio',)

@pytest.fixture
def sample_question():
    return "What is 2 + 2?"

@pytest.mark.parametrize("text,expected", [
    ("Some reasoning...\nFinal answer: 4", "4"),
    ("Complex calculation...\nFinal answer: *42*", "42"),
    ("Multiple steps...\nFinal answer: 3.14", "3.14"),
])
def test_extract_answer(text, expected):
    result = extract_answer(text)
    assert result == expected

@pytest_asyncio.fixture
async def mock_cohere():
    with patch('backend.models.Cohere.call_model', new_callable=AsyncMock) as mock:
        yield mock

@pytest_asyncio.fixture
async def mock_comparator():
    with patch('backend.validation.LLMAnswerComparator.llm_answers_equivalent_full', new_callable=AsyncMock) as mock:
        yield mock

@pytest.mark.asyncio
async def test_majority_vote(sample_question, mock_cohere):
    mock_cohere.return_value = "Final answer: 4"
    model = Cohere()
    
    result = await majority_vote(sample_question, 3, model)
    
    assert isinstance(result, dict)
    assert "4" in result
    assert result["4"]["count"] == 3
    assert result["4"]["frequency"] == 1.0
    assert mock_cohere.call_count == 3

@pytest.mark.asyncio
async def test_majority_vote_multiple_answers(sample_question, mock_cohere):
    responses = ["Final answer: 4", "Final answer: 5", "Final answer: 4"]
    mock_cohere.side_effect = responses
    model = Cohere()
    
    result = await majority_vote(sample_question, 3, model)
    
    assert len(result) == 2
    assert result["4"]["count"] == 2
    assert result["4"]["frequency"] == 2/3
    assert result["5"]["count"] == 1
    assert result["5"]["frequency"] == 1/3

@pytest.mark.asyncio
async def test_generate_answers(sample_question, mock_cohere, mock_comparator):
    # Mock model responses - two responses of "4" and one of "5"
    mock_cohere.side_effect = [
        "Final answer: 4",
        "Final answer: 4",
        "Final answer: 5"
    ]
    model = Cohere()
    
    # Mock comparator to consider the answers
    class MockEquivalenceResult:
        def __init__(self, status):
            self.status = status
    
    mock_comparator.side_effect = [
        MockEquivalenceResult(Equality.UNEQUAL),  # 4 vs 5
        MockEquivalenceResult(Equality.UNEQUAL),  # 4 vs 5
        MockEquivalenceResult(Equality.UNEQUAL)   # 4 vs 5
    ]
    
    result = await generate_answers(sample_question, 3, model)
    
    assert isinstance(result, dict)
    print(f"Result dictionary: {result}")  # Debug print
    
    # Two responses are "4" and one is "5"
    assert "4" in result
    assert "5" in result
    assert abs(result["4"] - 66.67) < 0.01  # 2/3 * 100 ≈ 66.67%
    assert abs(result["5"] - 33.33) < 0.01  # 1/3 * 100 ≈ 33.33%

    
@pytest.mark.asyncio
async def test_generate_answers_all_same(sample_question, mock_cohere, mock_comparator):
    mock_cohere.return_value = "Final answer: 4"
    model = Cohere()
    
    result = await generate_answers(sample_question, 3, model)
    
    assert len(result) == 1
    assert abs(result["4"] - 100.0) < 0.01

@pytest.mark.asyncio
async def test_generate_answers_empty_response(sample_question, mock_cohere):
    mock_cohere.return_value = ""
    model = Cohere()
    
    result = await generate_answers(sample_question, 3, model)
    
    assert isinstance(result, dict)
    assert len(result) == 1
    assert "" in result

@pytest.mark.asyncio
async def test_model_exception(sample_question, mock_cohere):
    mock_cohere.side_effect = Exception("Model error")
    model = Cohere()
    
    result = await generate_answers(sample_question, 3, model)
    assert result == {"no answers generated": 0}