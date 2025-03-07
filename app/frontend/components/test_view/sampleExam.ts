import { Exam } from "./exam";

export const sampleExam: Exam = {
  id: "1",
  title: "MAT223 Midterm 2",
  description:
    "This midterm assesses foundational concepts such as vectors and vector spaces, matrix operations, solving systems of linear equations, determinants, and linear transformations.",
  privacy: "Private",
  questions: [
    {
      question:
        "Find the eigenvalues and eigenvectors of the following matrix:\nA = [ 2 1 ]\n    [ 1 2 ]\na) Compute the eigenvalues of A.\nb) For each eigenvalue, find the corresponding eigenvector(s).",
      mainAnswer:
        "a) The eigenvalues are λ₁ = 3 and λ₂ = 1\nb) The corresponding eigenvectors are...",
      mainAnswerConfidence: 90,
      alternativeAnswers: [
        {
          answer: "Alternative solution using characteristic polynomial...",
          confidence: 85,
        },
      ],
    },
    {
      question:
        "Find the eigenvalues and eigenvectors of the following matrix:\nA = [ 2 1 ]\n    [ 1 2 ]\na) Compute the eigenvalues of A.\nb) For each eigenvalue, find the corresponding eigenvector(s).",
      mainAnswer:
        "a) The eigenvalues are λ₁ = 3 and λ₂ = 1\nb) The corresponding eigenvectors are...",
      mainAnswerConfidence: 90,
      alternativeAnswers: [
        {
          answer: "Alternative solution using characteristic polynomial...",
          confidence: 85,
        },
        {
          answer: "Alternative solution using characteristic polynomial...",
          confidence: 85,
        },
        {
          answer: "Alternative solution using characteristic polynomial...",
          confidence: 85,
        },
      ],
    },
  ],
};