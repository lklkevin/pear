import pytest
import pytest_asyncio
from backend.questionGenerator import generate_questions
from backend.models import Cohere
from unittest.mock import patch, AsyncMock

# Configure pytest-asyncio
pytest_plugins = ('pytest_asyncio',)

# Sample test questions
@pytest.fixture
def sample_questions():
    return [
        "What is 2 + 2?",
        "Solve for x: 3x + 5 = 11",
        "Calculate the area of a circle with radius 5"
    ]

# Test successful question generation
@pytest_asyncio.fixture
async def mock_cohere():
    with patch('backend.models.Cohere.call_model', new_callable=AsyncMock) as mock:
        yield mock

@pytest.mark.asyncio
async def test_successful_question_generation(sample_questions, mock_cohere):
    mock_cohere.return_value = '["What is 4 + 4?", "Solve for y: 2y - 3 = 7"]'
    model = Cohere()
    
    result = await generate_questions(sample_questions, 2, model)
    
    assert isinstance(result, list)
    assert len(result) == 2
    assert all(isinstance(q, str) for q in result)
    
    # Verify the prompt format
    called_prompt = mock_cohere.call_args[0][0]
    assert "Here are 3 questions:" in called_prompt
    assert "Generate 2 new questions" in called_prompt

@pytest.mark.asyncio
async def test_empty_input(mock_cohere):
    model = Cohere()
    result = await generate_questions([], 1, model)
    assert isinstance(result, list)
    assert len(result) == 0

@pytest.mark.asyncio
async def test_invalid_model_response(sample_questions, mock_cohere):
    mock_cohere.return_value = '```python\n["What is 4 + 4?", "Solve for y: 2y - 3 = 7"]\n```'
    model = Cohere()
    result = await generate_questions(sample_questions, 2, model)
    assert result == []

@pytest.mark.asyncio
async def test_model_exception(sample_questions, mock_cohere):
    mock_cohere.side_effect = Exception("Model error")
    model = Cohere()
    result = await generate_questions(sample_questions, 2, model)
    assert result == []

@pytest.mark.asyncio
async def test_large_question_count(sample_questions, mock_cohere):
    mock_cohere.return_value = str(["Question " + str(i) for i in range(100)])
    model = Cohere()
    
    result = await generate_questions(sample_questions, 100, model)
    assert isinstance(result, list)
    assert len(result) == 100

@pytest.mark.asyncio
async def test_zero_new_questions(sample_questions, mock_cohere):
    model = Cohere()
    result = await generate_questions(sample_questions, 0, model)
    assert isinstance(result, list)
    assert len(result) == 0

@pytest.mark.asyncio
async def test_negative_question_count(sample_questions, mock_cohere):
    model = Cohere()
    result = await generate_questions(sample_questions, -1, model)
    assert isinstance(result, list)
    assert len(result) == 0