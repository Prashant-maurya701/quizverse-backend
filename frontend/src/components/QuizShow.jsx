import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import React from 'react';

const QuizShow = () => {
    const { id } = useParams();
    const [quiz, setQuiz] = useState(null);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const res = await api.get(`/quizzes/${id}`);
                setQuiz(res.data);
            } catch (err) {
                console.error('Failed to fetch quiz');
            }
        };
        fetchQuiz();
    }, [id]);

    if (!quiz) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">{quiz.title}</h1>
            <p className="text-gray-600 mb-2">{quiz.description}</p>
            <p className="text-sm text-gray-500 mb-6">Created by: {quiz.createdBy.name}</p>

            <div className="space-y-6">
                {quiz.questions.map((question, index) => (
                    <div key={question._id} className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4">Question {index + 1}: {question.questionText}</h2>
                        <ul className="space-y-2">
                            {question.options.map((option, optIndex) => (
                                <li key={optIndex} className={`p-2 rounded ${optIndex === question.correctAnswer ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
                                    {option}
                                </li>
                            ))}
                        </ul>
                        <p className="mt-4 text-sm text-gray-500">Correct Answer: {question.options[question.correctAnswer]}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default QuizShow;
