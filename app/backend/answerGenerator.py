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
    results = await tqdm_asyncio.gather(*coroutines, desc="Generating possible answers:")

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

    # List of unique answers
    unique_answers = list(result_dict.keys())
    num_answers = len(unique_answers)

    # Initialize 2D matrix for equivalence checks
    unique_answers_matrix = [[None] * num_answers for _ in range(num_answers)]
    equivalence_tasks = []

    # Populate matrix with coroutines (only for i < j)
    for i in range(num_answers):
        for j in range(i + 1, num_answers):
            task = comparator.llm_answers_equivalent_full(unique_answers[i], unique_answers[j])
            unique_answers_matrix[i][j] = task
            equivalence_tasks.append(task)

    # Await all equivalence checks concurrently
    results = await tqdm_asyncio.gather(*equivalence_tasks, desc="Grouping answers:")


    # Fill in matrix with actual results
    index = 0
    for i in range(num_answers):
        for j in range(i + 1, num_answers):
            unique_answers_matrix[i][j] = results[index].status == validation.Equality.EQUAL
            index += 1

    # Merge equivalent answers
    merged_dict = {}
    merged_indices = set()

    for i in range(num_answers):
        if i in merged_indices:
            continue  # Skip already merged answers

        merged_answer = unique_answers[i]
        merged_count = result_dict[merged_answer]['count']
        merged_frequency = result_dict[merged_answer]['frequency']

        for j in range(i + 1, num_answers):
            if unique_answers_matrix[i][j]:  # If equivalent
                merged_count += result_dict[unique_answers[j]]['count']
                merged_frequency += result_dict[unique_answers[j]]['frequency']
                merged_indices.add(j)  # Mark as merged

        # Store final merged result
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
