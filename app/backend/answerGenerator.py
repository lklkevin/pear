from collections import Counter
from typing import Dict, Union
from models import Cohere
import asyncio
from tqdm.asyncio import tqdm, tqdm_asyncio
import validation


def extract_answer(text: str) -> str:
    """Extract the final answer from the model's response."""
    ans = text.split('Final answer:')[-1].replace('*', '').strip()
    return ans


async def majority_vote(prompt: str, n: int) -> Dict[str, Dict[str, Union[int, float]]]:
    """
    Get multiple model responses and return a dictionary with both counts and frequencies.

    Args:
        prompt: The prompt to send to the model
        n: Number of times to query the model

    Returns:
        Dictionary with answers as keys and nested dictionaries containing:
            - count: number of times this answer appeared
            - frequency: fraction of times this answer appeared (count/n)
    """
    model = Cohere()
    coroutines = [
        model.call_model('command-r-plus-08-2024',
                         'You are an intelligent math solver expert.',
                         prompt,
                         temperature=1,
                         is_answer=False)
        for _ in range(n)
    ]

    # Run coroutines concurrently with progress bar
    results = await tqdm_asyncio.gather(*coroutines, desc="Processing")

    # Extract answers and count them
    answers = [extract_answer(r) for r in results]
    counts = Counter(answers)

    # Create dictionary with counts and frequencies
    result_dict = {
        answer: {
            'count': count,
            'frequency': count / n
        }
        for answer, count in counts.items()
    }

    return result_dict


async def generate_answers(question: str, n: int) -> Dict[str, int | float]:
    prompt = f"Solve this question:\n Question: {question} \n at the end of your reasoning give me the final answer " \
             f"in the format 'Final answer: <answer>'. Do **NOT** output your answer " \
             f"with ',' separating the numbers every magnitude of 1000."

    comparator = validation.LLMAnswerComparator(tolerance=1e-5)
    result_dict = await majority_vote(prompt, n)

    # Merge equivalent answers using LLMAnswerComparator
    unique_answers = list(result_dict.keys())  # List to iterate over safely
    merged_dict = {}  # Store merged results

    for answer in unique_answers:
        if answer not in result_dict:  # It may have been merged already
            continue

        merged_answer = answer
        merged_count = result_dict[answer]['count']
        merged_frequency = result_dict[answer]['frequency']

        for other_answer in list(result_dict.keys()):
            if answer == other_answer or other_answer not in result_dict:
                continue  # Skip comparing identical or already merged entries

            # Check if answers are equivalent
            are_equal = await comparator.llm_answers_equivalent_full(answer, other_answer)

            if are_equal.status == validation.Equality.EQUAL:  # If validator confirms equivalence
                merged_count += result_dict[other_answer]['count']
                merged_frequency += result_dict[other_answer]['frequency']
                del result_dict[other_answer]  # Remove duplicate answer

        # Store the merged result
        merged_dict[merged_answer] = round(merged_frequency * 100, 2)

    return merged_dict


# ---------------------- Example Usage ----------------------
if __name__ == "__main__":
    questions = [
        "Tom is painting a fence 100 feet long. He starts at the West end of the fence and paints "
        "at a rate of 5 feet per hour. After 2 hours, Huck joins Tom and begins painting from the "
        "East end of the fence at a rate of 8 feet per hour. After another 2 hours of the two boys "
        "painting at the same time, Tom leaves Huck to finish the job by himself. If Huck "
        "completes painting the entire fence after Tom leaves, how many more hours will Huck work "
        "than Tom. Possible Answers: 5 hours, 3 hours, 4 hours, 6 hours, 10 hours",
        "Simplify the fraction to the lowest terms: \\frac{924}{1092}",
        "Solve the following equation for x in terms of the other variables: \\frac{ax}{b−ax}=2",
        "Solve the following equation for x in terms of the other variables: bcx=a",
        "Cindy's Cotton Candy sells cotton candy by the bag. Her monthly fixed costs are $150. "
        "It costs $2.50 to make each bag and she sells them for $4.00. To make a profit of $150, "
        "how many bags of cotton candy must be sold?"
    ]

    for question in questions:
        answers = asyncio.run(generate_answers(question, 20))
        print(f"Question: {question} \n Answers: {answers}\n")
