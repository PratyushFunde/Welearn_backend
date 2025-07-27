const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
    },
    answer: {
        type: String,
        required: true,
    },
});

const interviewSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId, // assuming userId references a User collection
            ref: 'User',
            required: true,
        },
        questions: {
            type: [questionSchema],
            default: [],
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Interview', interviewSchema);
