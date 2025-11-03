const express = require('express');
const Attempt = require('../models/Attempt');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get attempts for current user's quizzes
router.get('/', auth, async (req, res) => {
    try {
        // Get all quizzes created by the current user
        const userQuizzes = await Quiz.find({ createdBy: req.user.id });
        const userQuizIds = userQuizzes.map(q => q._id);

        // Get attempts for those quizzes
        const attempts = await Attempt.find({ quiz: { $in: userQuizIds } }).populate('quiz', 'title').populate('student', 'name');
        res.json(attempts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Start attempt
router.post('/:quizId', auth, async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.quizId);
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

        const attempt = new Attempt({ quiz: req.params.quizId, student: req.user.id });
        await attempt.save();
        res.status(201).json(attempt);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Submit attempt
router.put('/:id', auth, async (req, res) => {
    const { answers, timeTaken } = req.body;
    try {
        const attempt = await Attempt.findById(req.params.id);
        if (!attempt || attempt.student.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        let totalQuestions = 0;
        let correctAnswers = 0;

        // Get all questions for this quiz to calculate total
        const quiz = await Quiz.findById(attempt.quiz).populate('questions');
        totalQuestions = quiz.questions.length;

        for (const ans of answers) {
            const question = await Question.findById(ans.question);
            if (question.correctAnswer === ans.selectedOption) {
                correctAnswers++;
            }
        }

        attempt.answers = answers;
        attempt.score = correctAnswers; // Score is the number of correct answers
        attempt.completedAt = new Date();
        attempt.timeTaken = timeTaken;
        await attempt.save();

        // Return attempt with additional info
        res.json({
            ...attempt.toObject(),
            totalQuestions,
            correctAnswers,
            scoreDisplay: `${correctAnswers}/${totalQuestions}`
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get attempts for user
router.get('/user/:userId', auth, async (req, res) => {
    try {
        const attempts = await Attempt.find({ student: req.params.userId }).populate('quiz', 'title');
        res.json(attempts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get specific attempt by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const attempt = await Attempt.findById(req.params.id).populate('quiz');
        if (!attempt || attempt.student.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        res.json(attempt);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Leaderboard for a quiz
router.get('/leaderboard/:quizId', auth, async (req, res) => {
    try {
        const attempts = await Attempt.find({ quiz: req.params.quizId, completedAt: { $exists: true } })
            .populate('student', 'name')
            .sort({ score: -1, timeTaken: 1 });

        // Add score display info to each attempt
        const quiz = await Quiz.findById(req.params.quizId).populate('questions');
        const totalQuestions = quiz.questions.length;

        const attemptsWithScoreDisplay = attempts.map(attempt => ({
            ...attempt.toObject(),
            totalQuestions,
            correctAnswers: attempt.answers ? attempt.answers.filter(ans =>
                quiz.questions.find(q => q._id.toString() === ans.question.toString())?.correctAnswer === ans.selectedOption
            ).length : 0
        }));

        res.json(attemptsWithScoreDisplay);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
