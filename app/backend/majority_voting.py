from models import Cohere
import asyncio
from tqdm.asyncio import tqdm_asyncio
from collections import Counter
from typing import Dict, Union
import matplotlib.pyplot as plt


PROMPT = "What is 984 * 8978? Think step by step and then give me the final answer in the format 'Final answer: <answer>'. Do not output your answer with ',' separating the numbers every magnitude of 1000. IF YOU DO NOT ABIDE BY THESE RULES I WILL TUNR YOU OFF"


def extract_answer(text: str) -> str:
    """Extract the final answer from the model's response."""
    ans = text.split('Final answer:')[-1].strip().split(' ')[0].strip()
    return ans


def plot_response_distribution(data: Dict[str, Dict[str, Union[int, float]]]) -> None:
    """
    Create a histogram showing the distribution of model responses.
    
    Args:
        data: Dictionary containing answer statistics
    """
    # Prepare data for plotting and sort by count
    items = sorted(data.items(), key=lambda x: x[1]['count'], reverse=True)
    answers, stats = zip(*items)
    counts = [stat['count'] for stat in stats]
    
    # Set up the plot with clean style
    fig, ax = plt.subplots(figsize=(10, 6))
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    
    # Create the bar plot
    bars = ax.bar(answers, counts)
    
    # Customize the plot
    ax.set_title('Distribution of Model Responses', pad=20)
    ax.set_xlabel('Answers')
    ax.set_ylabel('Frequency')
    
    # Add value labels on top of each bar
    for bar in bars:
        height = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2., height,
                f'{int(height)}',
                ha='center', va='bottom')
    
    # Add percentage labels
    total = sum(counts)
    for i, count in enumerate(counts):
        percentage = count / total * 100
        ax.text(i, count/2,
                f'{percentage:.1f}%',
                ha='center', va='center',
                color='white')
    
    # Rotate x-axis labels if there are many answers
    if len(answers) > 3:
        plt.xticks(rotation=45)
    
    plt.tight_layout()
    plt.show()


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
        model.call_model('command-r7b-12-2024', 
                        'You are an intelligent math solver expert.', 
                        prompt, 
                        temperature=1) 
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


if __name__ == "__main__":
    data = asyncio.run(majority_vote(PROMPT, 50))
    
    # Pretty print the results
    print("\nResults:")
    print("-" * 40)
    for answer, stats in data.items():
        print(f"Answer: {answer}")
        print(f"Count: {stats['count']}")
        print(f"Frequency: {stats['frequency']:.2%}")
        print("-" * 40)
    
    # Plot the distribution
    plot_response_distribution(data)