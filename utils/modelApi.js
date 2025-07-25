const fs = require('fs');
const pdfParse = require('pdf-parse');
const axios = require('axios');

async function handleOpenRouterPdfUpload(filePath) {
    const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

    try {
        const pdfBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(pdfBuffer); // Extract text from PDF

        const extractedText = data.text.slice(0, 1000); // Limit text to avoid request size issues


        const payload = {
            model: "qwen/qwen3-coder:free",
            messages: [
                {
                    role: "user",
                    content: `Summarize the following content and give response only in json format which includes skills,experiences do not include anything else and give in json format only only skillas as array and experience as any array do not include anything else ! :\n\n${extractedText}`
                }
            ]
        };

        const response = await axios.post(OPENROUTER_API_URL, payload, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`
            }
        });


        fs.unlinkSync(filePath); // Optional: delete the uploaded file
        return response.data.choices[0].message.content;
    } catch (err) {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        if (err.response?.status === 429) {
            const rateLimitError = new Error("Rate limit exceeded. Please try again later.");
            rateLimitError.statusCode = 429;
            throw rateLimitError;
        }

        const generalError = new Error("Something went wrong while processing the file.");
        generalError.statusCode = 500;
        throw generalError;
    }
}

module.exports = handleOpenRouterPdfUpload;
