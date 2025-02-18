from models import Cohere
import asyncio


async def generate_questions(questions: list[str], Num_new_questions: int) -> list[str]:
    num_questions = len(questions)
    prompt_formatter = f"Here are {num_questions} questions:\n"

    for i in range(num_questions):
        prompt_formatter += questions[i] + "\n"

    prompt_formatter += f"\nGenerate {Num_new_questions} new questions that tackle the same mathematical concepts to " \
                        f"the current questions provided.\n"
    prompt_formatter += "Provide only the questions unnumbered and on seperate lines. No explanation needs to be given."

    model = Cohere()

    response = await model.call_model(
        'command-r-plus-08-2024',
        'You are an intelligent test creator.',
        prompt_formatter,
        temperature=1,
        is_answer=False
    )

    new_questions = response.split("\n\n")

    return new_questions

# ---------------------- Example Usage ----------------------
if __name__ == "__main__":
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

    new_questions = asyncio.run(generate_questions(questions, 3))
    print(new_questions)
