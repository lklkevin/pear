export interface AlternativeAnswer {
  answer: string;
  confidence: number; // percentage from 0 to 100
}

export interface Question {
  question: string;
  mainAnswer: string;
  mainAnswerConfidence: number; // percentage from 0 to 100
  alternativeAnswers: AlternativeAnswer[];
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  isPublic: boolean; // true for public, false for private
  questions: Question[];
}
