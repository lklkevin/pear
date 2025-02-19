import streamlit as st
import asyncio
import tempfile

from questionGenerator import generate_questions
from answerGenerator import generate_answers
from exam import Exam

# Additional imports for PDF scanning
from PdfScanner.GeminiPdfScanner import GeminiPDFScanner

# Initialize session state for storing exam data
if "exam" not in st.session_state:
    st.session_state.exam = Exam()

st.title("AI Exam Generator")
st.write("This tool generates exam questions and answers using AI.")

# Step 0: Upload a PDF file containing exam questions
st.header("Step 0: Upload PDF File")
uploaded_pdf = st.file_uploader("Upload a PDF file containing exam questions", type=["pdf"])
scanned_questions = []

if uploaded_pdf is not None:
    with st.spinner("Scanning and processing the PDF..."):
        # Save the uploaded PDF to a temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
            tmp_file.write(uploaded_pdf.read())
            pdf_path = tmp_file.name

        # Initialize the PDF scanner using your provided models
        scanner = GeminiPDFScanner()

        # Scan the PDF (pass a list with the single PDF path)
        pdf_objects = scanner.scan_pdfs([pdf_path])

        if pdf_objects:
            # Extract questions from the first (or only) PDFObject
            scanned_questions = [question for question, _ in pdf_objects[0].qa_pairs]
            st.success("PDF scanned successfully. Questions extracted.")
        else:
            st.error("No questions found in the PDF.")

# Step 1: Provide Your Exam Questions
st.header("Step 1: Provide Your Exam Questions")
# Set the default number of questions based on scanned questions if available
default_n = len(scanned_questions) if scanned_questions else 1
n = st.number_input("How many questions are in your exam?", min_value=1, step=1, value=default_n)

questions = []
for i in range(n):
    # Use the scanned question as a default if available; otherwise, leave blank
    default_question = scanned_questions[i] if i < len(scanned_questions) else ""
    question = st.text_input(f"Question {i + 1}", value=default_question)
    if question:
        questions.append(question)

# Step 2: Choose the number of new questions to generate
st.header("Step 2: Generate New Questions")
x = st.number_input("How many questions do you want in your new exam?", min_value=1, step=1, value=n)

# Step 3: Generate Questions & Answers when the button is pressed
if st.button("Generate Exam"):
    if questions:
        with st.spinner("Generating new questions..."):
            new_questions = asyncio.run(generate_questions(questions, x))
            for question in new_questions:
                st.session_state.exam.add_question(question)
        st.success("Questions generated successfully!")

        # Generate answers for each new question
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

    # Function to prepare the exam content for download
    def save_exam():
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
