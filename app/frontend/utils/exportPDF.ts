import * as pdfMake from "pdfmake/build/pdfmake";
import { Exam } from "@/components/test_view/exam";

/**
 * Font configuration for PDF generation
 * Uses DejaVu Sans font family for better Unicode support
 * Includes normal, bold, italic, and bold-italic variants
 */
const fonts = {
  DejaVuSans: {
    normal: `${process.env.NEXT_PUBLIC_URL}/fonts/DejaVuSans.ttf`,
    bold: `${process.env.NEXT_PUBLIC_URL}/fonts/DejaVuSans-Bold.ttf`,
    italics: `${process.env.NEXT_PUBLIC_URL}/fonts/DejaVuSans-Oblique.ttf`,
    bolditalics: `${process.env.NEXT_PUBLIC_URL}/fonts/DejaVuSans-BoldOblique.ttf`,
  },
};

/**
 * Generates and downloads a PDF version of an exam
 * Features:
 * - Exam title and description
 * - Numbered questions
 * - Optional answers with confidence scores
 * - Alternative answers (up to 3)
 * - Custom styling and formatting
 * - Unicode font support
 * 
 * @param {Exam} exam - The exam data to convert to PDF
 * @param {boolean} [answer=true] - Whether to include answers in the PDF
 * @returns {void} Triggers PDF download in the browser
 */
export const handleDownload = (exam: Exam, answer: boolean = true): void => {
  const docDefinition: any = {
    content: [
      { text: exam.title, style: "examTitle" },
      {
        text: exam.description,
        style: "examDescription",
        margin: [0, 5, 0, 15],
      },

      ...exam.questions.map((q, index) => ({
        table: {
          widths: ["auto", "*"],
          body: [
            [
              { text: `${index + 1}.`, style: "questionNumber" },
              { text: q.question, style: "question", margin: [5, 0, 0, 0] },
            ],
            answer
              ? [
                  "",
                  {
                    text: `Answer: ${q.mainAnswer} (${q.mainAnswerConfidence}% Confidence)`,
                    style: "answer",
                    margin: [5, 5, 0, 5],
                  },
                ]
              : ["", { text: " ", margin: [5, 5, 0, 5] }], // Maintain spacing
            answer && q.alternativeAnswers.length > 0
              ? [
                  "",
                  {
                    text: "Alternative Answers:",
                    style: "altHeader",
                    margin: [5, 0, 0, 2],
                  },
                ]
              : ["", { text: " ", margin: [0, 0, 0, 0] }],
            answer && q.alternativeAnswers.length > 0
              ? [
                  "",
                  {
                    ul: q.alternativeAnswers
                      .slice(0, 3) // Show only first 3 alternative answers
                      .map((alt) => `${alt.answer} (${alt.confidence}%)`),
                    margin: [10, 0, 0, 10],
                  },
                ]
              : ["", { text: " ", margin: [0, 0, 0, 0] }],
          ],
        },
        layout: "noBorders",
      })),
    ],
    styles: {
      examTitle: {
        fontSize: 22,
        bold: true,
        alignment: "center",
        margin: [0, 0, 0, 10],
      },
      examDescription: { fontSize: 12, italics: true, alignment: "center" },
      questionNumber: { fontSize: 12, bold: true, alignment: "left" },
      question: { fontSize: 12, margin: [0, 10, 0, 5] },
      answer: { fontSize: 12, bold: true, color: "blue" },
      altHeader: { fontSize: 12, color: "gray" },
    },
    defaultStyle: {
      fontSize: 10,
      font: "DejaVuSans",
    },
  };

  pdfMake.createPdf(docDefinition, {}, fonts).download(`${exam.title}.pdf`);
};
