from abc import ABC
from llm_model import LLMModel


class GPT4Model(LLMModel, ABC):
    """
    GPT-4 model implementation for math question generation.
    """

    def __init__(self, api_key: str):
        super().__init__(model_name="GPT-4")
        self.api_key = api_key

    def call_model(self, prompt: str) -> dict:
        # Simulating API call to GPT-4 (actual implementation would use OpenAI API)

        return {
            "model": self.model_name,
            "original": prompt,
            "generated_response": "response",
        }
