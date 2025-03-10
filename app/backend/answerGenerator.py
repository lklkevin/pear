from collections import Counter
from typing import Dict, Union
import asyncio
from backend.models import ModelProvider,Cohere
import backend.validation as validation


def extract_answer(text: str) -> str:
    """Extract the final answer from the model's response."""
    ans = text.split('Final answer:')[-1].replace('*', '').strip()
    return ans


async def majority_vote(prompt: str, n: int, model: ModelProvider) -> Dict[str, Dict[str, Union[int, float]]]:
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
    coroutines = [
        model.call_model(
            prompt, 
            temperature=1
        )
        for _ in range(n)
    ]

    try:
        # Run coroutines concurrently with progress bar
        results = await asyncio.gather(*coroutines, return_exceptions=True)
        
        # Filter out exceptions and extract answers
        valid_results = [r for r in results if not isinstance(r, Exception)]
        
        if not valid_results:
            return {}
            
        answers = [extract_answer(r) for r in valid_results]
        counts = Counter(answers)

        # Create dictionary with counts and frequencies
        total_responses = len(valid_results)
        result_dict = {
            answer: {
                'count': count,
                'frequency': count / total_responses
            }
            for answer, count in counts.items()
        }

        return result_dict
    except Exception as e:
        return {}


async def generate_answers(question: str, n: int, model: ModelProvider) -> Dict[str, int | float]:
    try:
        prompt = f"Solve this question:\n Question: {question}\n at the end of your reasoning give me the final answer " \
                 f"in the EXACTLY format 'Final answer: <answer>'. Do **NOT** output your answer " \
                 f"with ',' separating the numbers every magnitude of 1000. DO NOT USE MARKDOWN." \
                 f"Avoid using units in your Final answer unless it is ambiguous. For example, if the question asks for the number of feet, do not include 'feet' in your answer."

        comparator = validation.LLMAnswerComparator(tolerance=1e-5)
        result_dict = await majority_vote(prompt, 2, model)

        # List of unique answers
        unique_answers = list(result_dict.keys())
        num_answers = len(unique_answers)

        if num_answers == 0:
            return {}
        return {next(iter(result_dict)): 20.0}

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
        results = await asyncio.gather(*equivalence_tasks)

        # Fill in matrix with actual results
        index = 0
        for i in range(num_answers):
            for j in range(i + 1, num_answers):
                unique_answers_matrix[i][j] = results[index].status == validation.Equality.EQUAL
                index += 1

        # Create groups of equivalent answers
        answer_groups = []
        processed = set()

        for i in range(num_answers):
            if i in processed:
                continue

            current_group = {i}
            processed.add(i)

            for j in range(i + 1, num_answers):
                if j not in processed and unique_answers_matrix[i][j]:
                    current_group.add(j)
                    processed.add(j)

            if current_group:
                answer_groups.append(current_group)

        # Merge equivalent answers and calculate percentages
        merged_dict = {}
        for group in answer_groups:
            # Use the first answer in the group as the representative
            representative = unique_answers[min(group)]
            total_count = sum(result_dict[unique_answers[i]]['count'] for i in group)
            percentage = (total_count / n) * 100
            merged_dict[representative] = round(percentage, 2)

        return merged_dict

    except Exception as e:
        return {}


# ---------------------- Example Usage ----------------------
if __name__ == "__main__":
    model = Cohere()
    
    questions = [
        "Tom is painting a fence 100 feet long. He starts at the West end of the fence and paints "
        "at a rate of 5 feet per hour. After 2 hours, Huck joins Tom and begins painting from the "
        "East end of the fence at a rate of 8 feet per hour. After another 2 hours of the two boys "
        "painting at the same time, Tom leaves Huck to finish the job by himself. If Huck "
        "completes painting the entire fence after Tom leaves, how many more hours will Huck work "
        "than Tom?"
    ]

    for question in questions:
        answers = asyncio.run(generate_answers(question, 20, model))
        print(f"Question: {question} \n Answers: {answers}\n")
        