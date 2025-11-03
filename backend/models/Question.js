const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
    questionText: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: Number, required: true }, // index of correct option
    points: { type: Number, default: 1 },
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);
