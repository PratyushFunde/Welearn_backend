const express = require('express');
const multer = require('multer');
const audioRouter = express.Router();

// Configure Multer with proper file filtering
const upload = multer({
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    // List of allowed MIME types for audio files
    const allowedMimeTypes = [
      'audio/wav',
      'audio/x-wav',
      'audio/wave',
      'audio/x-pn-wav',
      'audio/mpeg',
      'audio/mp3',
      'audio/mp4',
      'audio/m4a'
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}. Only audio files are allowed.`), false);
    }
  },
  limits: {
    fileSize: 25 * 1024 * 1024 // 25MB limit
  }
});

const audioController = require('../controllers/audioController');

audioRouter.post('/transcribeAudio', upload.single('file'), audioController.transcribeAudio);

module.exports = audioRouter;