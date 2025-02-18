import asyncio
import os
from dotenv import load_dotenv

import cohere
from google import genai
from google.genai import types

load_dotenv()


class ModelProvider:
    def __init__(self):
        pass

    def call_model(self, model, preamble, prompt, is_answer=True, **kwargs):
        raise NotImplementedError


class PDFModelProvider:
    """
    Abstract base class for models that take PDFs as input.
    """

    def call_model(self, pdf_path: str, prompt: str, **kwargs) -> str:
        """
        Abstract method to be implemented by subclasses to call the model.

        Args:
            pdf_path (str): The path to the PDF file.
            prompt (str): The user-provided prompt to guide text generation.

        Returns:
            str: The model's generated response.
        """
        pass


class GeminiPDFModel(PDFModelProvider):
    """
    Gemini implementation of the PDFModelProvider, using Google's Gemini API.
    """

    def __init__(self, model: str = "gemini-2.0-flash"):
        """
        Initializes the Gemini model with an API key and model selection.

        Args:
            api_key (str): The API key for Gemini API.
            model (str): The specific Gemini model to use.
        """
        self.client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
        self.model = model

    def call_model(self, pdf_path: str, prompt: str, **kwargs) -> str:
        """
        Reads the PDF as raw bytes, wraps it in a types.Part to preserve the document's content,
        and calls the Gemini API to generate a response based on the provided prompt.

        Args:
            pdf_path (str): The file path to the PDF document.
            prompt (str): The prompt to guide the Gemini API's text generation.

        Returns:
            str: The generated response text from the Gemini model.
        """
        with open(pdf_path, "rb") as f:
            pdf_bytes = f.read()
        pdf_part = types.Part.from_bytes(data=pdf_bytes, mime_type="application/pdf")
        contents = [pdf_part, prompt]

        response = self.client.models.generate_content(
            model=self.model,
            contents=contents,
            **kwargs
        )
        return response.text


class Cohere(ModelProvider):

    def __init__(self):
        self.client = cohere.AsyncClient(os.environ.get("COHERE_API_KEY"))

    async def call_model(self, model, preamble, prompt, is_answer=True, **kwargs):

        for _ in range(5):
            try:
                response = await self.client.chat(
                    model=model, message=prompt, preamble=preamble, **kwargs
                )
                if is_answer:
                    test = int(
                        response.text.split("Final answer:")[-1]
                        .strip()
                        .split(" ")[0]
                        .replace(".", "")
                        .replace("*", "")
                        .strip()
                    )
                return response.text
            except Exception as e:
                print(e)


if __name__ == "__main__":
    co = Cohere()
    print(
        asyncio.run(
            co.call_model(
                "command-r7b-12-2024",
                "You are a dumbass",
                prompt="What is 1+1",
                temperature=1.0,
                return_prompt=True,
            )
        )
    )
