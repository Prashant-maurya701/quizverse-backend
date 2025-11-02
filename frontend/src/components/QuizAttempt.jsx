import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import React from 'react';

const QuizAttempt = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [attemptId, setAttemptId] = useState(null);

    useEffect(() => {
        const startAttempt = async () => {
            try {
                const attemptRes = await api.post(`/attempts/${id}`);
                setAttemptId(attemptRes.data._id);
                const quizRes = await api.get(`/quizzes/${id}`);
                setQuiz(quizRes.data);
            } catch (err) {
                console.error('Failed to start attempt or fetch quiz');
            }
        };
        startAttempt();
    }, [id]);

    const handleAnswer = (questionIndex, selectedOption) => {
        const newAnswers = [...answers];
        newAnswers[questionIndex] = { question: quiz.questions[questionIndex]._id, selectedOption };
        setAnswers(newAnswers);
    };

    const nextQuestion = () => {
        if (currentQuestion < quiz.questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            submitQuiz();
        }
    };

    const submitQuiz = async () => {
        try {
            const res = await api.put(`/attempts/${attemptId}`, { answers });
            // Navigate directly to leaderboard
            navigate(`/leaderboard/${id}`);
        } catch (err) {
            console.error('Failed to submit quiz');
        }
    };

    if (!quiz) return <div>Loading...</div>;

    if (!quiz.questions || quiz.questions.length === 0) {
        return <div>No questions available for this quiz.</div>;
    }

    if (currentQuestion >= quiz.questions.length) {
        return <div>Invalid question index.</div>;
    }

    const question = quiz.questions[currentQuestion];

    return (
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-4">{quiz.title}</h1>
            <div className="mb-6">
                <h2 className="text-xl mb-2">Question {currentQuestion + 1}</h2>
                <p className="mb-4">{question.questionText}</p>
                <div className="space-y-2">
                    {question.options.map((option, index) => (
                        <label key={index} className="block">
                            <input
                                type="radio"
                                name={`question-${question._id}`}
                                value={index}
                                onChange={() => handleAnswer(currentQuestion, index)}
                                checked={answers[currentQuestion]?.selectedOption === index}
                                className="mr-2"
                            />
                            {option}
                        </label>
                    ))}
                </div>
            </div>
            <button
                onClick={nextQuestion}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
                {currentQuestion < quiz.questions.length - 1 ? 'Next' : 'Submit'}
            </button>
        </div>
    );
};

export default QuizAttempt;
