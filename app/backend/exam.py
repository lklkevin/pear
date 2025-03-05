from typing import List, Dict, Union

class Exam:
    def __init__(self):
        self.questions: List[str] = []
        self.answers: Dict[str, str] = {}  # Stores only the highest-confidence answer per question
        self.answer_confidence: Dict[str, Dict[str, Union[int, float]]] = {}  # Stores all answers with their confidence scores

    def add_question(self, question: str):
        """Adds a question to the exam."""
        self.questions.append(question)

    def get_question(self, index: int = None) -> Union[str, List[str]]:
        """
        Retrieves a specific question by index or all questions if no index is provided.

        Args:
            index (int, optional): The index of the question to retrieve.

        Returns:
            Union[str, List[str]]: A specific question if index is provided, otherwise all questions.
        """
        if index is None:
            return self.questions  # Return all questions
        elif 0 <= index < len(self.questions):
            return self.questions[index]  # Return the question at the specified index
        else:
            raise IndexError("Question index out of range")

    def add_answers(self, question: str, answers: Dict[str, Union[int, float]]):
        """
        Stores all answers with their confidence and selects the highest-confidence answer.

        Args:
            question (str): The question associated with the answers.
            answers (Dict[str, int | float]): A dictionary where keys are possible answers and values are confidence scores.
        """
        if question not in self.questions:
            print(f"Error: Question '{question}' not found in the exam.")
            return

        if not answers:
            print(f"Error: No answers provided for question '{question}'.")
            return

        # Store all answers in answer_confidence
        self.answer_confidence[question] = answers

        # Select the answer with the highest confidence
        best_answer = max(answers, key=answers.get)
        self.answers[question] = best_answer  # Store only the best answer

    def get_best_answer(self, question: str) -> str:
        """Retrieves the highest-confidence answer for a given question."""
        return self.answers.get(question)

    def get_all_answers(self, question: str) -> Dict[str, Union[int, float]]:
        """Retrieves all answers with their confidence scores for a given question."""
        return self.answer_confidence.get(question)

    def get_confidence(self, question: str, answer: str) -> Union[int, float]:
        """Retrieves all answers with their confidence scores for a given question."""
        return self.answer_confidence.get(question).get(answer)

    def display_exam(self):
        """Prints all questions with their best answer and confidence scores."""
        for question in self.questions:
            print("\n" + "=" * 80)
            print(f"📌 **Question:** {question}")
            all_answers = self.answer_confidence.get(question, {})
            best_answer = self.answers.get(question, "No answer available")

            print(f"✅ **Best Answer:** {best_answer} (Confidence: {all_answers.get(best_answer, 0):.2f}%)")

            if all_answers:
                print("\n💡 **All Answers & Confidence Scores:**")
                # Sort answers by confidence in descending order
                sorted_answers = sorted(all_answers.items(), key=lambda x: x[1], reverse=True)
                for answer, confidence in sorted_answers:
                    best_marker = "🌟" if answer == best_answer else "   "
                    print(f"  {best_marker} {answer} → {confidence:.2f}%")
            else:
                print("\n⚠️ No answers available for this question.")

