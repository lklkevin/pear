import streamlit as st
import asyncio
from questionGenerator import generate_questions
from answerGenerator import generate_answers
from exam import Exam

# Initialize session state for storing exam data
if "exam" not in st.session_state:
    st.session_state.exam = Exam()

st.title("AI Exam Generator")

st.write("This tool generates exam questions and answers using AI.")

# Step 1: Get user input for existing exam
st.header("Step 1: Provide Your Exam Questions")

n = st.number_input("How many questions are in your exam?", min_value=1, step=1, value=1)

questions = []
for i in range(n):
    question = st.text_input(f"Question {i + 1}")
    if question:
        questions.append(question)

# Step 2: Choose number of new questions
st.header("Step 2: Generate New Questions")
x = st.number_input("How many questions do you want in your new exam?", min_value=1, step=1, value=n)

# Step 3: Generate Questions & Answers
if st.button("Generate Exam"):
    if questions:
        with st.spinner("Generating new questions..."):
            new_questions = asyncio.run(generate_questions(questions, x))
            for question in new_questions:
                st.session_state.exam.add_question(question)

        st.success("Questions generated successfully!")

        # Generate answers
        with st.spinner("Generating answers..."):
            for i, question in enumerate(new_questions, 1):
                st.write(f"**Generating answers for Question {i}...**")
                answers = asyncio.run(generate_answers(question, 10))
                st.session_state.exam.add_answers(question, answers)

        st.success("Answers generated successfully!")

# Step 4: Display the Generated Exam
if st.session_state.exam.questions:
    st.header("Generated Exam")

    for i, question in enumerate(st.session_state.exam.questions, 1):
        st.subheader(f"Question {i}")
        st.write(question)

        best_answer = st.session_state.exam.get_best_answer(question)
        confidence = st.session_state.exam.get_confidence(question, best_answer)
        st.write(f"**Best Answer:** {best_answer} (Confidence: {confidence:.2f})")


    # Option to download the exam
    def save_exam():
        """Returns the exam as a string for downloading."""
        content = "Generated Exam\n" + "=" * 50 + "\n\n"
        for i, question in enumerate(st.session_state.exam.questions, 1):
            content += f"Q{i}: {question}\n"

        content += "\nAnswer Key\n" + "=" * 50 + "\n\n"
        for i, question in enumerate(st.session_state.exam.questions, 1):
            best_answer = st.session_state.exam.get_best_answer(question)
            confidence = st.session_state.exam.get_confidence(question, best_answer)
            content += f"Q{i}: {best_answer} (Confidence: {confidence:.2f})\n"

        return content


    st.download_button(
        label="📥 Download Exam as Text File",
        data=save_exam(),
        file_name="generated_exam.txt",
        mime="text/plain",
    )
