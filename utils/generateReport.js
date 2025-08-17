const { default: axios } = require("axios")

const generateReport = async (data) => {
    try {
        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions',
            {
                model: "openai/gpt-oss-20b",
                temperature: 1,
                messages: [
                    {
                        role: 'user',
                        content: `This the the data of interview where user has answered the questions give analysis for each question and assign score outof 10. Data : ${JSON.stringify(data)}. Give response in json data in format question,answer,feedback,score do not include anything else. JUST jason response only !`
                    }
                ]
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
                }
            }
        )
        console.log(response)
        return response.data;
    }
    catch (error) {
        console.error('OpenRouter API Error:', error.response?.data || error.message);
        throw new Error('Failed to generate report from OpenRouter');
    }
}

module.exports={generateReport}