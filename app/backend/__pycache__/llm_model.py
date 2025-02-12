from abc import ABC, abstractmethod


class LLMModel(ABC):
    """
    Abstract base class for an LLM model used in math question generation.
    """
    def __init__(self, model_name: str):
        self.model_name = model_name

    @abstractmethod
    async def call_model(self, prompt):
        """
        Generate response.
        :param prompt: The input prompt exmp. math question
        :return: A dictionary containing generated questions and answers.
        """
        pass