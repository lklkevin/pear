import asyncio
import os
import logging
from dotenv import load_dotenv
from typing import Callable, Optional

import cohere
from google import genai
from google.genai.types import Part, GenerateContentConfig

load_dotenv()

# Configure logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.WARNING)

class ModelProvider:
    """
        Abstract base class for model providers that defines the interface
        and shared behavior for calling language models.
    """
    def __init__(self, model: str, max_reties: int, timeout: float):
        self.model = model
        self.max_retries = max_reties
        self.timeout = timeout
        self.default_preamble = "You are a helpful assistant"

    """
    Initializes the base model provider with common configuration.
    
    Args:
        model (str): The name or ID of the model.
        max_reties (int): The number of retry attempts on failure.
        timeout (float): The timeout in seconds for each model call.
    """
    async def call_model(self, prompt: str, preamble: Optional[str], pdf_path: Optional[str], accept_func: Callable, **kwargs) -> str:
        """
        Abstract method for calling the language model.

        Must be implemented by subclasses.

        Args:
            prompt (str): The user prompt.
            preamble (Optional[str]): The system message to guide the model's behavior.
            pdf_path (Optional[str]): Optional path to a PDF for contextual input.
            accept_func (Callable): A function to validate the model's response.

        Returns:
            str: The model's response.
        """
        raise NotImplementedError

    def load_pdf(self, pdf_path: str) -> str:
        """
        Loads a PDF from the given file path and converts it to a Part object
        for model consumption.

        Args:
            pdf_path (str): The path to the PDF file.

        Returns:
            Part: A Gemini-compatible Part containing the PDF data.
        """
        try:
            with open(pdf_path, "rb") as f:
                pdf_bytes = f.read()
            return Part.from_bytes(data=pdf_bytes, mime_type="application/pdf")
        except Exception as e:
            print(e)
            return


class GeminiModel(ModelProvider):
    """
    Gemini implementation of the ModelProvider, using Google's Gemini API.
    """

    def __init__(self, model: str = "gemini-2.0-flash", max_retries: int = 5, timeout: float = 30.0):
        """
        Initializes the Gemini model with an API key and model selection.

        Args:
            api_key (str): The API key for Gemini API.
            model (str): The specific Gemini model to use.
            timeout (float): Timeout in seconds for each API call attempt (default: 20s).
        """
        super().__init__(model, max_retries, timeout)
        self.client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

    async def call_model(self,
                         prompt: str,
                         preamble: Optional[str] = None,
                         pdf_data: Optional[bytes] = None,
                         pdf_path: Optional[str] = None,
                         accept_func: Callable = lambda x: True,
                         **kwargs) -> str:
        """
        Reads the PDF as raw bytes, wraps it in a Part to preserve the document's content,
        and calls the Gemini API to generate a response based on the provided prompt.

        Args:
            pdf_path (str): The file path to the PDF document.
            prompt (str): The prompt to guide the Gemini API's text generation.

        Returns:
            str: The generated response text from the Gemini model.
        """
        preamble = preamble if preamble is not None else self.default_preamble

        # if a PDF is being passed for extraction
        if pdf_path is not None:
            pdf_part = self.load_pdf(pdf_path)
            if pdf_part is None:
                return 
            kwargs['contents'] = [pdf_part, prompt]
        elif pdf_data is not None:
            try:
                pdf_part = Part.from_bytes(data=pdf_data, mime_type="application/pdf")
                kwargs['contents'] = [pdf_part, prompt]
            except Exception as e:
                print(e)
                return
            if pdf_part is None:
                return
        else:
            kwargs['contents'] = prompt

        for _ in range(self.max_retries):
            try:
                response = await asyncio.wait_for(
                    self.client.aio.models.generate_content(
                        model=self.model,
                        config=GenerateContentConfig(
                            system_instruction=preamble
                        ),
                        **kwargs
                    ),
                    timeout=self.timeout
                )
                assert accept_func(response.text), "Model returned an unacceptable response according to the accept function"
                return response.text.strip()
            except asyncio.TimeoutError:
                logger.warning(f"Gemini API call timed out after {self.timeout} seconds")
            except Exception as e:
                print(e)


class Cohere(ModelProvider):
    """
    Cohere implementation of the ModelProvider, using Cohere's AsyncClient.
    Note: Does not support PDF input.
    """
    def __init__(self, model: str = 'command-a-03-2025', max_retries: int = 5, timeout: float = 10.0):
        super().__init__(model, max_retries, timeout)
        self.client = cohere.AsyncClient(os.environ.get("COHERE_API_KEY"))

    async def call_model(self, prompt: str, preamble: Optional[str] = None, pdf_path: Optional[str] = None, accept_func: Callable = lambda x: True, **kwargs) -> str:

        if pdf_path is not None:
            raise NotImplementedError("Cohere does not support PDFs")

        preamble = preamble if preamble is not None else self.default_preamble

        for _ in range(self.max_retries):
            try:
                response = await asyncio.wait_for(
                    self.client.chat(
                        model=self.model, 
                        message=prompt, 
                        preamble=preamble,
                        **kwargs
                    ),
                    timeout=self.timeout
                )
                assert accept_func(response.text), "Model returned an unacceptable response according to the accept function"
                return response.text.strip()
            except asyncio.TimeoutError:
                logger.warning(f"Cohere API call timed out after {self.timeout} seconds")
            except Exception as e:
                print(e)


if __name__ == "__main__":
    co = Cohere(model="command-r7b-12-2024")
    print(
        asyncio.run(
            co.call_model(
                prompt="whats 9 + 10",
            )
        )
    )
