const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

async function sendAssessmentMail(userEmail, assessmentData) {
  try {
    // 1. Generate PDF file
    const pdfPath = path.join(__dirname, "assessment.pdf");
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(pdfPath));

    doc.fontSize(20).text("Interview Assessment Report", { align: "center" });
    doc.moveDown();

    assessmentData.forEach((item, index) => {
      doc.fontSize(14).fillColor("black").text(`Q${index + 1}: ${item.question}`);
      doc.moveDown(0.3);
      doc.fontSize(12).fillColor("blue").text(`Answer: ${item.answer}`);
      doc.moveDown(0.3);
      doc.fillColor("red").text(`Feedback: ${item.feedback}`);
      doc.moveDown(0.3);
      doc.fillColor("green").text(`Score: ${item.score}/10`);
      doc.moveDown(1);
    });

    doc.end();

    // 2. Create HTML Email
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding:20px; color:#333;">
        <h2 style="color:#2c3e50;">Interview Assessment Summary</h2>
        <p>Dear Candidate,</p>
        <p>Here is the summary of your interview assessment. Please find the attached PDF for details.</p>
        
        <div style="margin-top:20px;">
          ${assessmentData
            .map(
              (item, index) => `
              <div style="border:1px solid #ccc; border-radius:10px; padding:15px; margin-bottom:15px; background:#f9f9f9;">
                <h3 style="color:#34495e;">Question ${index + 1}</h3>
                <p><b>Q:</b> ${item.question}</p>
                <p style="color:#2c3e50;"><b>Answer:</b> ${item.answer}</p>
                <p style="color:#c0392b;"><b>Feedback:</b> ${item.feedback}</p>
                <p style="color:#27ae60;"><b>Score:</b> ${item.score}/10</p>
              </div>
            `
            )
            .join("")}
        </div>
        
        <p>Best Regards,<br><b>Interview Team</b></p>
      </div>
    `;

    // 3. Setup Nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail", // Or any SMTP provider
      auth: {
        user: process.env.EMAIL,
        pass: process.env.GOOGLE_MAIL_PASS, // use App password if Gmail
      },
    });

    // Wait for PDF to finish writing
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 4. Send Email
    let info = await transporter.sendMail({
      from: '"Interview Team" We Learn',
      to: userEmail,
      subject: "Your Interview Assessment Report",
      html: htmlContent,
      attachments: [
        {
          filename: "assessment.pdf",
          path: pdfPath,
        },
      ],
    });

    console.log("Email sent: " + info.messageId);

    // 5. Delete PDF after sending
    fs.unlinkSync(pdfPath);
    console.log("Temporary PDF deleted");
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

// Example usage:
const assessmentData = [
  {
    question: "Can you describe a technical challenge you faced while developing the YouTube summarization web app regarding authorization ?",
    answer: "by using machine learning and artificial intelligence.",
    feedback:
      "The answer is incomplete and does not address authorization; it mentions machine learning and AI without explaining how authorization issues were resolved. It lacks detail, clarity, and relevance to the question.",
    score: 2,
  },
  {
    question: "Can you describe the technical challenges you faced when integrating Gemini's features into your YouTube summarization web app?",
    answer: "Yes I gaced challenges in api keys and load management i solved it using algorithms",
    feedback:
      "The answer contains spelling errors and vague language. It briefly mentions API key and load-management challenges and claims a solution via algorithms, but it lacks specifics, explanation of the solution, and clarity.",
    score: 4,
  },
];

// Call function

module.exports={sendAssessmentMail}
