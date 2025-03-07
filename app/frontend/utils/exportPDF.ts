import { jsPDF } from "jspdf";
import { Exam } from "@/components/test_view/exam";

export const handleDownload = (exam: Exam) => {
  const doc = new jsPDF({
    unit: "pt", // Using points for slightly easier spacing control
    format: "letter", // or "a4", etc.
  });

  // Set some common margins
  const leftMargin = 50;
  const rightMargin = 550; // ~ 8" width if letter size (612 pts wide)
  const wrapWidth = rightMargin - leftMargin;

  // Adjust overall line height
  doc.setLineHeightFactor(1.3);

  // Current vertical position
  let yPosition = 60;

  // Helper: Adds a horizontal separator line
  const addSeparatorLine = () => {
    doc.setDrawColor(180, 180, 180); // light gray
    doc.setLineWidth(0.5);
    doc.line(leftMargin, yPosition, rightMargin, yPosition);
    yPosition += 10;
  };

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(exam.title, doc.internal.pageSize.getWidth() / 2, yPosition, {
    align: "center",
  });
  yPosition += 30;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);

  const descLines = doc.splitTextToSize(exam.description, wrapWidth);
  // If you want it centered:
  descLines.forEach((line: string | string[]) => {
    doc.text(line, doc.internal.pageSize.getWidth() / 2, yPosition, {
      align: "center",
    });
    yPosition += 14; // about one line of text
  });

  yPosition += 20; // extra space after description

  // Draw a separator
  addSeparatorLine();
  yPosition += 10;

  // Iterate over each question
  exam.questions.forEach((question, index) => {
    // Page break if near bottom
    if (yPosition > doc.internal.pageSize.getHeight() - 80) {
      doc.addPage();
      yPosition = 60;
    }

    // Question header in bold
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(`Question ${index + 1}`, leftMargin, yPosition);
    yPosition += 20;

    // Question text
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    const questionLines = doc.splitTextToSize(question.question, wrapWidth);
    questionLines.forEach((line: string | string[]) => {
      // Check for page break
      if (yPosition > doc.internal.pageSize.getHeight() - 60) {
        doc.addPage();
        yPosition = 60;
      }
      doc.text(line, leftMargin, yPosition);
      yPosition += 14;
    });

    yPosition += 10; // extra space

    // Main answer (bold label + normal text)
    doc.setFont("helvetica", "bold");
    doc.text("Answer:", leftMargin, yPosition);
    doc.setFont("helvetica", "normal");

    const mainAnswerText = `${question.mainAnswer} (${question.mainAnswerConfidence}%)`;
    const answerLines = doc.splitTextToSize(mainAnswerText, wrapWidth);

    yPosition += 14;
    answerLines.forEach((line: string | string[]) => {
      if (yPosition > doc.internal.pageSize.getHeight() - 60) {
        doc.addPage();
        yPosition = 60;
      }
      doc.text(line, leftMargin, yPosition);
      yPosition += 14;
    });

    yPosition += 10;

    // Alternative answers
    question.alternativeAnswers.forEach((alt, altIndex) => {
      doc.setFont("helvetica", "bold");
      doc.text(`Alt Answer ${altIndex + 1}:`, leftMargin, yPosition);
      doc.setFont("helvetica", "normal");

      const altText = `${alt.answer} (${alt.confidence}%)`;
      const altLines = doc.splitTextToSize(altText, wrapWidth);

      yPosition += 14;
      altLines.forEach((line: string | string[]) => {
        if (yPosition > doc.internal.pageSize.getHeight() - 60) {
          doc.addPage();
          yPosition = 60;
        }
        doc.text(line, leftMargin, yPosition);
        yPosition += 14;
      });

      yPosition += 10;
    });

    // Separator after each question
    addSeparatorLine();
    yPosition += 10;
  });

  // Finally, trigger the file download
  doc.save(`${exam.title}.pdf`);
};
