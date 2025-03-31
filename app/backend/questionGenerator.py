from backend.models import ModelProvider, Cohere
import asyncio
import ast
import ast


async def generate_questions(questions: list[str], num_new_questions: int, model: ModelProvider) -> list[str]:
    """
    Generates new questions based on the conceptual patterns of a provided list of questions
    using a language model.

    Args:
        questions (list[str]): A list of existing questions to serve as examples.
        num_new_questions (int): The number of new questions to generate.
        model (ModelProvider): An instance of a ModelProvider (e.g., Gemini or Cohere) used to generate questions.

    Returns:
        list[str]: A list of newly generated questions. Returns an empty list if an error occurs.

    Notes:
        - The prompt instructs the model to return only a raw Python list of strings.
        - The response is evaluated using `ast.literal_eval()` for safety.
        - The model must return valid Python syntax, or the function will catch and handle the exception.
    """
    try:
        assert len(questions) > 0, "Questions list cannot be empty"
        assert num_new_questions > 0, "Number of new questions must be greater than 0"
        num_questions = len(questions)
        prompt_formatter = f"Here are {num_questions} questions:\n"

        for i in range(num_questions):
            prompt_formatter += questions[i] + "\n"

        prompt_formatter += f"\nGenerate {num_new_questions} new questions that tackle the same mathematical concepts " \
                            f"as the current questions provided. Return the questions as a Python list of strings. " \
                            f"Just give me the list and nothing else. Do not include ```python or ``` in the response."
        response = await model.call_model(
            prompt_formatter,
            temperature=1,
            accept_func=lambda x: ast.literal_eval(x) is not None
        )

        new_questions = ast.literal_eval(response)
        return new_questions

    except Exception as e:
        print(f"Error generating questions: {e}")
        return []

# ---------------------- Example Usage ----------------------
if __name__ == "__main__":
    model = Cohere()
    questions = [
        "Tom is painting a fence 100 feet long. He starts at the West end of the fence and paints "
        "at a rate of 5 feet per hour. After 2 hours, Huck joins Tom and begins painting from the "
        "East end of the fence at a rate of 8 feet per hour. After 2 hours of the two boys "
        "painting at the same time, Tom leaves Huck to finish the job by himself. If Huck "
        "completes painting the entire fence after Tom leaves, how many more hours will Huck work "
        "than Tom",
        "Simplify the fraction to the lowest terms: \\frac{924}{1092}",
        "Solve the following equation for x in terms of the other variables: \\frac{ax}{b−ax}=2",
        "Solve the following equation for x in terms of the other variables: bcx=a",
        "Cindy's Cotton Candy sells cotton candy by the bag. Her monthly fixed costs are $150. "
        "It costs $2.50 to make each bag and she sells them for $4.00. To make a profit of $150, "
        "how many bags of cotton candy must be sold?"
    ]

    new_questions = asyncio.run(generate_questions(questions, 3, model))
    print(new_questions)
