const fs = require('fs');
const pdfParse = require('pdf-parse');
const axios = require('axios');

async function handleOpenRouterPdfUpload(filePath) {
    const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
    const OPENROUTER_API_KEY = process.env.API_KEY;

    try {
        const pdfBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(pdfBuffer); // Extract text from PDF

        const extractedText = data.text.slice(0, 1000); // Limit text to avoid request size issues


        const payload = {
            model: "google/gemma-3n-e4b-it:free",
            messages: [
                {
                    role: "user",
                    content: `Summarize the following content and give response only in json format which includes skills and experiences do not include anything else and give in json format . Response should containe skills an array of strings and experiences an array of strings${extractedText}`
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

async function handleGroqPdfUpload(filePath) {
    const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    try {
        const pdfBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(pdfBuffer);
        const extractedText = data.text.slice(0, 1000);

        const payload = {
            model: "gemma2-9b-it", // or "llama3-70b-instruct" if needed
            messages: [
                {
                    role: "user",
                    content: `Summarize the following content and give response only in json format which includes skills and experiences. Do not include anything else. Response should contain 'skills' as an array of strings and 'experiences' as an array of strings:\n\n${extractedText}`
                }
            ]
        };

        const response = await axios.post(GROQ_API_URL, payload, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            }
        });

        fs.unlinkSync(filePath);
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

module.exports = {handleOpenRouterPdfUpload,handleGroqPdfUpload};
