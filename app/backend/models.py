import asyncio
import os
from dotenv import load_dotenv
from typing import Callable, Optional

import cohere
from google import genai
from google.genai.types import Part, GenerateContentConfig

load_dotenv()


class ModelProvider:

    def __init__(self, model: str, max_reties: int):
        self.model = model
        self.max_retries = max_reties
        self.default_preamble = "You are a helpful assistant"

    async def call_model(self, prompt: str, preamble: Optional[str], pdf_path: Optional[str], accept_func: Callable, **kwargs) -> str:
        raise NotImplementedError

    def load_pdf(self, pdf_path: str) -> str:
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

    def __init__(self, model: str = "gemini-2.0-flash", max_retries: int = 5):
        """
        Initializes the Gemini model with an API key and model selection.

        Args:
            api_key (str): The API key for Gemini API.
            model (str): The specific Gemini model to use.
        """
        super().__init__(model, max_retries)
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
                response = await self.client.aio.models.generate_content(
                    model=self.model,
                    config=GenerateContentConfig(
                        system_instruction=preamble
                    ),
                    **kwargs
                )
                assert accept_func(response.text), "Model returned an unacceptable response according to the accept function"
                return response.text.strip()
            except Exception as e:
                print(e)


class Cohere(ModelProvider):

    def __init__(self, model: str = 'command-a-03-2025', max_retries: int = 5):
        super().__init__(model, max_retries)
        self.client = cohere.AsyncClient(os.environ.get("COHERE_API_KEY"))

    async def call_model(self, prompt: str, preamble: Optional[str] = None, pdf_path: Optional[str] = None, accept_func: Callable = lambda x: True, **kwargs) -> str:

        if pdf_path is not None:
            raise NotImplementedError("Cohere does not support PDFs")

        preamble = preamble if preamble is not None else self.default_preamble

        for _ in range(self.max_retries):
            try:
                response = await self.client.chat(
                    model=self.model, 
                    message=prompt, 
                    preamble=preamble,
                    **kwargs
                )
                assert accept_func(response.text), "Model returned an unacceptable response according to the accept function"
                return response.text.strip()
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
