from abc import ABC

from llm_model import LLMModel


class CohereModel(LLMModel, ABC):
    """
    Cohere model implementation for math question generation.
    """

    def __init__(self, api_key: str):
        super().__init__(model_name="Cohere")
        self.api_key = api_key

    def generate_questions(self, prompt: str) -> dict:
        # Simulating API call to Cohere (actual implementation would use Cohere API)
        return {
            "model": self.model_name,
            "original": prompt,
            "generated_response": "response"
        }
