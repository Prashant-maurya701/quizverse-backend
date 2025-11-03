const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema({
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    answers: [{ question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' }, selectedOption: Number }],
    score: { type: Number, default: 0 },
    completedAt: { type: Date },
    timeTaken: { type: Number }, // in seconds
}, { timestamps: true });

module.exports = mongoose.model('Attempt', attemptSchema);
