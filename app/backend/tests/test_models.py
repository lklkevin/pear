import asyncio

import pytest
import pytest_asyncio
from unittest.mock import AsyncMock, patch, MagicMock

from backend.models import Cohere, GeminiModel

# Force async tests with pytest
pytest_plugins = ('pytest_asyncio',)


@pytest.mark.asyncio
@patch("backend.models.cohere.AsyncClient.chat", new_callable=AsyncMock)
async def test_cohere_call_model_success(mock_chat):
    mock_chat.return_value.text = "Final answer: 42"
    model = Cohere()
    result = await model.call_model("What's 6 * 7?")

    assert result == "Final answer: 42"
    mock_chat.assert_called_once()


@pytest.mark.asyncio
@patch("backend.models.cohere.AsyncClient.chat", new_callable=AsyncMock)
async def test_cohere_call_model_with_timeout(mock_chat):
    mock_chat.side_effect = asyncio.TimeoutError("API timeout")
    model = Cohere(timeout=0.1, max_retries=1)

    result = await model.call_model("What's the capital of France?")
    assert result is None  # should fail silently and return None on timeout


@pytest.mark.asyncio
@patch("backend.models.genai.Client")
async def test_gemini_call_model_success(mock_client_class):
    # Create mock response
    mock_response = MagicMock()
    mock_response.text = "The result is 42"

    # Create async function that returns the mock response
    mock_generate_content = AsyncMock(return_value=mock_response)

    # Mock Gemini client structure: client.aio.models.generate_content
    mock_client = MagicMock()
    mock_client.aio.models.generate_content = mock_generate_content
    mock_client_class.return_value = mock_client

    model = GeminiModel()
    result = await model.call_model("What is 6 x 7?")

    assert result == "The result is 42"


@pytest.mark.asyncio
@patch("backend.models.genai.Client")
async def test_gemini_call_model_with_pdf_data(mock_client_class):
    # Create mock response
    mock_response = MagicMock()
    mock_response.text = "PDF answer"

    # Create async function that returns the mock response
    mock_generate_content = AsyncMock(return_value=mock_response)

    # Mock Gemini client structure: client.aio.models.generate_content
    mock_client = MagicMock()
    mock_client.aio.models.generate_content = mock_generate_content
    mock_client_class.return_value = mock_client

    model = GeminiModel()
    fake_pdf_data = b"%PDF-1.4 fake content"

    result = await model.call_model(prompt="Summarize this", pdf_data=fake_pdf_data)

    assert result == "PDF answer"