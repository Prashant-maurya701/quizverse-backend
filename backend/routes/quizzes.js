const express = require('express');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Get all quizzes
router.get('/', auth, async (req, res) => {
    try {
        const quizzes = await Quiz.find().populate('createdBy', 'name _id').populate('questions');
        res.json(quizzes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create quiz (admin only)
router.post('/', auth, adminOnly, async (req, res) => {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Questions type:', typeof req.body.questions);
    console.log('Questions value:', req.body.questions);
    if (req.body.questions && req.body.questions.length > 0) {
        console.log('First question type:', typeof req.body.questions[0]);
        console.log('First question value:', req.body.questions[0]);
    }
    const { title, description, questions, timeLimit } = req.body;
    try {
        // Parse questions if they are strings
        let parsedQuestions = questions;
        if (questions && Array.isArray(questions) && questions.length > 0 && typeof questions[0] === 'string') {
            parsedQuestions = questions.map(q => typeof q === 'string' ? JSON.parse(q) : q);
        }

        let questionIds = [];

        // If questions are provided as embedded objects, create Question documents
        if (parsedQuestions && parsedQuestions.length > 0 && typeof parsedQuestions[0] === 'object') {
            for (const q of parsedQuestions) {
                const question = new Question({
                    quiz: null, // Will be set after quiz is created
                    questionText: q.question,
                    options: q.options,
                    correctAnswer: q.options.indexOf(q.correctAnswer), // Convert to index
                    points: 1
                });
                await question.save();
                questionIds.push(question._id);
            }
        } else {
            // If questions are already ObjectIds, use them directly
            questionIds = questions || [];
        }

        const quiz = new Quiz({
            title,
            description,
            questions: questionIds,
            createdBy: req.user.id,
            timeLimit
        });
        await quiz.save();

        // Update questions to reference the quiz
        if (questionIds.length > 0) {
            await Question.updateMany({ _id: { $in: questionIds } }, { quiz: quiz._id });
        }

        // Populate the quiz with questions before returning
        const populatedQuiz = await Quiz.findById(quiz._id).populate('questions');
        res.status(201).json(populatedQuiz);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get quiz by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id).populate('createdBy', 'name _id').populate('questions');
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
        res.json(quiz);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update quiz (admin only)
router.put('/:id', auth, adminOnly, async (req, res) => {
    const { title, description, questions, timeLimit } = req.body;
    try {
        // Parse questions if they are strings
        let parsedQuestions = questions;
        if (questions && Array.isArray(questions) && questions.length > 0 && typeof questions[0] === 'string') {
            parsedQuestions = questions.map(q => typeof q === 'string' ? JSON.parse(q) : q);
        }

        let questionIds = [];

        // If questions are provided as embedded objects, create Question documents
        if (parsedQuestions && parsedQuestions.length > 0 && typeof parsedQuestions[0] === 'object') {
            // Delete existing questions for this quiz
            const existingQuiz = await Quiz.findById(req.params.id);
            if (existingQuiz && existingQuiz.questions.length > 0) {
                await Question.deleteMany({ _id: { $in: existingQuiz.questions } });
            }

            // Create new questions
            for (const q of parsedQuestions) {
                const question = new Question({
                    quiz: req.params.id,
                    questionText: q.question,
                    options: q.options,
                    correctAnswer: q.options.indexOf(q.correctAnswer), // Convert to index
                    points: 1
                });
                await question.save();
                questionIds.push(question._id);
            }
        } else {
            // If questions are already ObjectIds, use them directly
            questionIds = questions || [];
        }

        const updateData = {
            title,
            description,
            timeLimit
        };

        if (questionIds.length > 0) {
            updateData.questions = questionIds;
        }

        const quiz = await Quiz.findByIdAndUpdate(req.params.id, updateData, { new: true }).populate('questions');
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
        res.json(quiz);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete quiz (admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
    try {
        await Quiz.findByIdAndDelete(req.params.id);
        res.json({ message: 'Quiz deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add question to quiz
router.post('/:id/questions', auth, adminOnly, async (req, res) => {
    const { questionText, options, correctAnswer, points } = req.body;
    try {
        const question = new Question({ quiz: req.params.id, questionText, options, correctAnswer, points });
        await question.save();
        await Quiz.findByIdAndUpdate(req.params.id, { $push: { questions: question._id } });
        res.status(201).json(question);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
