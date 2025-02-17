import asyncio
from questionGenerator import generate_questions
from answerGenerator import generate_answers
from exam import Exam


def get_int_input(prompt: str) -> int:
    """Helper function to safely get an integer input from the user."""
    while True:
        try:
            value = int(input(prompt))
            if value < 1:
                raise ValueError("Please enter a positive integer.")
            return value
        except ValueError as e:
            print(f"❌ Invalid input: {e}. Try again.")


def save_exam_to_file(exam: Exam, filename="exam.txt"):
    """Saves the exam questions and answer key to a text file, including confidence scores."""
    try:
        with open(filename, "w", encoding="utf-8") as f:
            f.write("Generated Exam\n")
            f.write("=" * 50 + "\n\n")

            for i, question in enumerate(exam.questions, 1):
                f.write(f"Q{i}: {question}\n")

            f.write("\nAnswer Key\n")
            f.write("=" * 50 + "\n\n")

            for i, question in enumerate(exam.questions, 1):
                best_answer = exam.get_best_answer(question)
                confidence = exam.get_confidence(question, best_answer)
                f.write(f"Q{i}: {best_answer} (Confidence: {confidence:.2f})\n")

        print(f"\n✅ Exam saved to '{filename}' successfully!")

    except Exception as e:
        print(f"❌ Error saving file: {e}")


def print_exam(exam: Exam):
    """Prints the exam questions and answer key with confidence scores."""
    print("\nGenerated Exam")
    print("=" * 50)
    for i, question in enumerate(exam.questions, 1):
        print(f"Q{i}: {question}")

    print("\nAnswer Key")
    print("=" * 50)
    for i, question in enumerate(exam.questions, 1):
        best_answer = exam.get_best_answer(question)
        confidence = exam.get_confidence(question, best_answer)
        print(f"Q{i}: {best_answer} (Confidence: {confidence:.2f})")


def main():
    exam = Exam()

    print("Welcome to our AI exam generator: \nTo start, you must input a practice exam:\n")
    print("---------------------SIMULATING EXAM EXTRACTED FROM PDF-----------------------\n")

    n = get_int_input("How many questions are in your exam? ")

    questions = []
    for i in range(n):
        while True:
            try:
                question = input(f"Question {i + 1}: ").strip()
                if not question:
                    raise ValueError("Question cannot be empty.")
                questions.append(question)
                break
            except ValueError as e:
                print(f"❌ Invalid input: {e}. Try again.")

    print("\n---------------------------GENERATING NEW EXAM-------------------------------\n")

    x = get_int_input("How many questions do you want to have in your exam? ")

    print("\n--------------------------Generating Questions-------------------------------\n")

    new_questions = asyncio.run(generate_questions(questions, x))

    for question in new_questions:
        exam.add_question(question)

    print("\n---------------------------Questions Generated--------------------------------\n")
    print("\n---------------------------Generating Answers---------------------------------\n")
    for question in new_questions:
        answers = asyncio.run(generate_answers(question, 10))
        exam.add_answers(question, answers)
    print("\n----------------------------Answers Generated---------------------------------\n")
    print("\n------------------------Exam Successfully Generated---------------------------\n")

    while True:
        print("Would you like to: \n1. Print the exam\n2. Download as a text file\n3. Both")
        choice = input("Enter your choice (1, 2, or 3): ").strip()

        if choice == "1":
            print_exam(exam)
            break
        elif choice == "2":
            save_exam_to_file(exam)
            break
        elif choice == "3":
            print_exam(exam)
            save_exam_to_file(exam)
            break
        else:
            print("❌ Invalid choice. Please enter '1', '2', or '3'.")


if __name__ == "__main__":
    main()
