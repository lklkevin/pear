import cohere
import openai

import asyncio
from dotenv import load_dotenv
import os
load_dotenv()


class ModelProvider:

    def __init__(self):
        pass
    def call_model(self, model, messages, **kwargs):
        raise NotImplementedError


class OpenAI(ModelProvider):

    def __init__(self):
        self.client = cohere.AsyncClient(os.environ.get('COHERE_API_KEY'))

    async def call_model(self, model, preamble, prompt, **kwargs):

        for _ in range(5):
            try:
                response = await self.client.chat(
                    model=model,
                    message=prompt,
                    preamble=preamble,
                    **kwargs
                )
                if 'Final answer:' in response.text:
                    return response.text
            except Exception as e:
                print(e)

class Cohere(ModelProvider):

    def __init__(self):
        self.client = cohere.AsyncClient(os.environ.get('COHERE_API_KEY'))

    async def call_model(self, model, preamble, prompt, **kwargs):

        for _ in range(5):
            try:
                response = await self.client.chat(
                    model=model,
                    message=prompt,
                    preamble=preamble,
                    **kwargs
                )
                test = int(response.text.split('Final answer:')[-1].strip().split(' ')[0].strip())
                return response.text
            except Exception as e:
                print(e)
            


if __name__ == "__main__":
    co = Cohere()
    print(asyncio.run(co.call_model('command-r7b-12-2024', 'You are a dumbass', prompt='What is 1+1', temperature=1.0, return_prompt=True)))