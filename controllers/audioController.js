const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

exports.transcribeAudio = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file uploaded' });
    }

    // Verify the file exists
    if (!fs.existsSync(req.file.path)) {
      return res.status(400).json({ error: 'File upload failed' });
    }

    // Prepare form data for Groq API
    const form = new FormData();
    form.append('file', fs.createReadStream(req.file.path), {
      filename: req.file.originalname || 'audio.wav',
      contentType: req.file.mimetype || 'audio/wav'
    });
    form.append('model', 'whisper-large-v3');
    form.append('temperature', '0');
    form.append('response_format', 'verbose_json');
    // form.append('timestamp_granularities', ["word"]);
    form.append('language', 'en');

    // Make request to Groq API
    const response = await axios.post(
      'https://api.groq.com/openai/v1/audio/transcriptions',
      form,
      {
        headers: {
          ...form.getHeaders(),
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      }
    );

    // Clean up the uploaded file
    fs.unlinkSync(req.file.path);

    return res.json(response.data.text);
  } catch (error) {
    // Clean up file if error occurred
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data?.error?.message || 
                       error.message || 
                       'Audio transcription failed';

    return res.status(statusCode).json({
      error: errorMessage,
      details: {
        fileInfo: req.file ? {
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size
        } : null,
        apiError: error.response?.data
      }
    });
  }
};