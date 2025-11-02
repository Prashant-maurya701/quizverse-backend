import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import React from 'react';

const Leaderboard = ({ quizId: propQuizId }) => {
    const { quizId: paramQuizId } = useParams();
    const quizId = propQuizId || paramQuizId;
    const navigate = useNavigate();
    const [leaderboard, setLeaderboard] = useState([]);
    const [userScore, setUserScore] = useState(null);
    const [quizTitle, setQuizTitle] = useState('');

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await api.get(`/attempts/leaderboard/${quizId}`);
                setLeaderboard(res.data);

                // Find current user's score
                const userAttempts = res.data.filter(attempt =>
                    attempt.student._id === JSON.parse(localStorage.getItem('user'))._id
                );
                if (userAttempts.length > 0) {
                    const latestAttempt = userAttempts[0]; // Already sorted by score desc
                    setUserScore({
                        score: latestAttempt.score,
                        rank: res.data.findIndex(attempt =>
                            attempt.student._id === JSON.parse(localStorage.getItem('user'))._id
                        ) + 1,
                        totalQuestions: latestAttempt.totalQuestions || 10, // fallback
                        correctAnswers: latestAttempt.correctAnswers || latestAttempt.score
                    });
                }

                // Fetch quiz title
                const quizRes = await api.get(`/quizzes/${quizId}`);
                setQuizTitle(quizRes.data.title);
            } catch (err) {
                console.error('Failed to fetch leaderboard or quiz title');
            }
        };
        fetchLeaderboard();
    }, [quizId]);

    const getScoreDisplay = (entry) => {
        if (entry.correctAnswers !== undefined && entry.totalQuestions !== undefined) {
            return `${entry.correctAnswers}/${entry.totalQuestions}`;
        }
        // Fallback for old entries
        return entry.score || '0/10';
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Leaderboard - {quizTitle}</h1>
                <button
                    onClick={() => navigate('/')}
                    className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                >
                    Back to Quizzes
                </button>
            </div>

            {userScore && (
                <div className="bg-blue-100 p-4 rounded-lg mb-6">
                    <h2 className="text-lg font-semibold mb-2">Your Performance</h2>
                    <p className="text-xl">Score: {getScoreDisplay(userScore)}</p>
                    <p className="text-lg">Rank: #{userScore.rank}</p>
                </div>
            )}

            <table className="w-full">
                <thead>
                    <tr className="border-b">
                        <th className="text-left py-2">Rank</th>
                        <th className="text-left py-2">Name</th>
                        <th className="text-left py-2">Score</th>
                    </tr>
                </thead>
                <tbody>
                    {leaderboard.map((entry, index) => (
                        <tr key={entry._id} className="border-b">
                            <td className="py-2">{index + 1}</td>
                            <td className="py-2">{entry.student.name}</td>
                            <td className="py-2">{getScoreDisplay(entry)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Leaderboard;
