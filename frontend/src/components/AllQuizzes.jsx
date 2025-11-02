import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Leaderboard from './Leaderboard';
import React from 'react';

const AllQuizzes = () => {
    const { user, loading } = useAuth();
    const [quizzes, setQuizzes] = useState([]);
    const [selectedLeaderboard, setSelectedLeaderboard] = useState(null);

    useEffect(() => {
        if (!loading && user) {
            const fetchQuizzes = async () => {
                try {
                    const res = await api.get('/quizzes');
                    setQuizzes(res.data);
                } catch (err) {
                    console.error('Failed to fetch quizzes');
                }
            };
            fetchQuizzes();
        }
    }, [user, loading]);

    const myQuizzes = quizzes.filter(quiz => quiz.createdBy._id === user.id);
    const otherQuizzes = quizzes.filter(quiz => quiz.createdBy._id !== user.id);

    const handleShowLeaderboard = (quizId) => {
        setSelectedLeaderboard(quizId);
    };

    const handleCloseLeaderboard = () => {
        setSelectedLeaderboard(null);
    };

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-800 mb-2">All Quizzes</h1>
                <p className="text-gray-600">Explore quizzes and view leaderboards</p>
            </div>

            {selectedLeaderboard && (
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <Leaderboard quizId={selectedLeaderboard} />
                    <div className="mt-6 text-center">
                        <button
                            onClick={handleCloseLeaderboard}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
                        >
                            Close Leaderboard
                        </button>
                    </div>
                </div>
            )}

            {myQuizzes.length > 0 && (
                <div className="space-y-6">
                    <h2 className="text-3xl font-semibold text-gray-800">My Quizzes</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {myQuizzes.map((quiz) => (
                            <div key={quiz._id} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-semibold text-gray-800 mb-2">{quiz.title}</h3>
                                        <p className="text-gray-600 text-sm line-clamp-2">{quiz.description}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleShowLeaderboard(quiz._id)}
                                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-3 rounded-lg transition-all font-medium"
                                >
                                    Show Leaderboard
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {otherQuizzes.length > 0 && (
                <div className="space-y-6">
                    <h2 className="text-3xl font-semibold text-gray-800">All Quizzes</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {otherQuizzes.map((quiz) => (
                            <div key={quiz._id} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-semibold text-gray-800 mb-2">{quiz.title}</h3>
                                        <p className="text-gray-600 text-sm line-clamp-2">{quiz.description}</p>
                                        <p className="text-xs text-gray-500 mt-1">Created by: {quiz.createdBy.name}</p>
                                    </div>
                                </div>
                                <Link
                                    to={`/quiz-show/${quiz._id}`}
                                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-3 rounded-lg transition-all font-medium text-center block"
                                >
                                    Show Quiz
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {myQuizzes.length === 0 && otherQuizzes.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">📚</div>
                    <h3 className="text-2xl font-semibold text-gray-800 mb-2">No Quizzes Available</h3>
                    <p className="text-gray-600">Check back later for new quizzes!</p>
                </div>
            )}
        </div>
    );
};

export default AllQuizzes;
