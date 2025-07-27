const axios = require('axios')

const createQuestion = async (userMessage) => {
    try {
        const response = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
                model: 'google/gemma-3n-e2b-it:free',
                messages: [
                    {
                        role: 'user',
                        content: userMessage
                    }
                ]
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
                }
            }
        );

        return response.data;
    } catch (error) {
        console.error('OpenRouter API Error:', error.response?.data || error.message);
        throw new Error('Failed to get response from OpenRouter');
    }
};

module.exports = { createQuestion };