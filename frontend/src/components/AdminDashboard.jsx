import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import React from 'react';

const AdminDashboard = () => {
    const { user, loading } = useAuth();
    const [quizzes, setQuizzes] = useState([]);
    const [stats, setStats] = useState({ totalQuizzes: 0, totalAttempts: 0 });
    const [newQuiz, setNewQuiz] = useState({ title: '', description: '', questions: [] });
    const [editingQuiz, setEditingQuiz] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [leaderboards, setLeaderboards] = useState({});
    const [showLeaderboard, setShowLeaderboard] = useState({});

    useEffect(() => {
        if (!loading && user) {
            fetchQuizzes();
        }
    }, [user, loading]);

    useEffect(() => {
        if (quizzes.length > 0) {
            fetchStats();
        }
    }, [quizzes]);

    const fetchQuizzes = async () => {
        try {
            const res = await api.get('/quizzes');
            const userQuizzes = res.data.filter(quiz => quiz.createdBy._id.toString() === user.id);
            setQuizzes(userQuizzes);
        } catch (err) {
            console.error('Failed to fetch quizzes');
        }
    };

    const fetchStats = async () => {
        try {
            const attemptsRes = await api.get('/attempts');
            const userQuizIds = quizzes.map(q => q._id.toString());
            const userAttempts = attemptsRes.data.filter(attempt =>
                userQuizIds.includes(attempt.quiz._id.toString())
            );
            setStats({
                totalQuizzes: quizzes.length,
                totalAttempts: userAttempts.length
            });
        } catch (err) {
            console.error('Failed to fetch stats');
        }
    };

    const fetchLeaderboard = async (quizId) => {
        try {
            const res = await api.get(`/attempts/leaderboard/${quizId}`);
            setLeaderboards(prev => ({ ...prev, [quizId]: res.data }));
        } catch (err) {
            console.error('Failed to fetch leaderboard');
        }
    };

    const toggleLeaderboard = (quizId) => {
        setShowLeaderboard(prev => {
            const newState = { ...prev, [quizId]: !prev[quizId] };
            if (newState[quizId] && !leaderboards[quizId]) {
                fetchLeaderboard(quizId);
            }
            return newState;
        });
    };

    const handleCreateOrUpdateQuiz = async () => {
        try {
            let response;
            if (editingQuiz) {
                response = await api.put(`/quizzes/${editingQuiz}`, newQuiz);
            } else {
                response = await api.post('/quizzes', newQuiz);
            }
            setNewQuiz({ title: '', description: '', questions: [] });
            setEditingQuiz(null);
            setShowCreateForm(false);
            fetchQuizzes();
        } catch (err) {
            console.error('Failed to create/update quiz', err);
            alert('Failed to create/update quiz: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleDeleteQuiz = async (id) => {
        if (window.confirm('Are you sure you want to delete this quiz?')) {
            try {
                await api.delete(`/quizzes/${id}`);
                fetchQuizzes();
            } catch (err) {
                console.error('Failed to delete quiz');
                alert('Failed to delete quiz');
            }
        }
    };

    const addQuestion = () => {
        setNewQuiz({
            ...newQuiz,
            questions: [...newQuiz.questions, { question: '', options: ['', '', '', ''], correctAnswer: '' }]
        });
    };

    const removeQuestion = (index) => {
        const questions = [...newQuiz.questions];
        questions.splice(index, 1);
        setNewQuiz({ ...newQuiz, questions });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">Welcome back, {user?.name}!</h1>
                    <p className="text-gray-600 text-lg">Manage your quizzes and track performance</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                        <div className="flex items-center">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <span className="text-2xl">📚</span>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-2xl font-bold text-gray-800">{stats.totalQuizzes}</h3>
                                <p className="text-gray-600">Total Quizzes</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                        <div className="flex items-center">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <span className="text-2xl">👥</span>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-2xl font-bold text-gray-800">{stats.totalAttempts}</h3>
                                <p className="text-gray-600">Total Attempts</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                        <div className="flex items-center">
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <span className="text-2xl">🏆</span>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-2xl font-bold text-gray-800">Admin</h3>
                                <p className="text-gray-600">Role</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                            onClick={() => setShowCreateForm(true)}
                            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-4 rounded-lg transition-all font-medium text-lg flex items-center justify-center space-x-2"
                        >
                            <span>➕</span>
                            <span>Create New Quiz</span>
                        </button>
                        <Link
                            to="/all-quizzes"
                            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-4 rounded-lg transition-all font-medium text-lg flex items-center justify-center space-x-2"
                        >
                            <span>📊</span>
                            <span>View All Quizzes</span>
                        </Link>
                    </div>
                </div>

                {/* Create/Edit Quiz Form */}
                {showCreateForm && (
                    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-semibold text-gray-800">
                                {editingQuiz ? 'Edit Quiz' : 'Create New Quiz'}
                            </h2>
                            <button
                                onClick={() => {
                                    setShowCreateForm(false);
                                    setEditingQuiz(null);
                                    setNewQuiz({ title: '', description: '', questions: [] });
                                }}
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Quiz Title *</label>
                                    <input
                                        type="text"
                                        placeholder="Enter quiz title"
                                        value={newQuiz.title}
                                        onChange={(e) => setNewQuiz({ ...newQuiz, title: e.target.value })}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Quiz Description</label>
                                    <textarea
                                        placeholder="Enter quiz description"
                                        value={newQuiz.description}
                                        onChange={(e) => setNewQuiz({ ...newQuiz, description: e.target.value })}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors h-12 resize-none"
                                        rows="1"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-800">Questions</h3>
                                <button
                                    onClick={addQuestion}
                                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors font-medium flex items-center space-x-2"
                                >
                                    <span>+</span>
                                    <span>Add Question</span>
                                </button>
                            </div>

                            <div className="space-y-6">
                                {newQuiz.questions.map((q, index) => (
                                    <div key={index} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="text-lg font-medium text-gray-800">Question {index + 1}</h4>
                                            <button
                                                onClick={() => removeQuestion(index)}
                                                className="text-red-500 hover:text-red-700 text-xl"
                                            >
                                                ×
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Question Text *</label>
                                                <input
                                                    type="text"
                                                    placeholder="Enter your question"
                                                    value={q.question}
                                                    onChange={(e) => {
                                                        const questions = [...newQuiz.questions];
                                                        questions[index].question = e.target.value;
                                                        setNewQuiz({ ...newQuiz, questions });
                                                    }}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                                    required
                                                />
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-4">
                                                {q.options.map((option, optIndex) => (
                                                    <div key={optIndex}>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">Option {optIndex + 1} *</label>
                                                        <input
                                                            type="text"
                                                            placeholder={`Enter option ${optIndex + 1}`}
                                                            value={option}
                                                            onChange={(e) => {
                                                                const questions = [...newQuiz.questions];
                                                                questions[index].options[optIndex] = e.target.value;
                                                                setNewQuiz({ ...newQuiz, questions });
                                                            }}
                                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                                            required
                                                        />
                                                    </div>
                                                ))}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Correct Answer *</label>
                                                <select
                                                    value={q.correctAnswer}
                                                    onChange={(e) => {
                                                        const questions = [...newQuiz.questions];
                                                        questions[index].correctAnswer = e.target.value;
                                                        setNewQuiz({ ...newQuiz, questions });
                                                    }}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                                    required
                                                >
                                                    <option value="">Select correct answer</option>
                                                    {q.options.map((option, optIndex) => (
                                                        <option key={optIndex} value={option}>{option || `Option ${optIndex + 1}`}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {newQuiz.questions.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    <div className="text-4xl mb-2">❓</div>
                                    <p>No questions added yet. Click "Add Question" to get started.</p>
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                                <button
                                    onClick={handleCreateOrUpdateQuiz}
                                    disabled={!newQuiz.title.trim() || newQuiz.questions.length === 0}
                                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg transition-colors font-medium"
                                >
                                    {editingQuiz ? 'Update Quiz' : 'Create Quiz'}
                                </button>
                                <button
                                    onClick={() => {
                                        setShowCreateForm(false);
                                        setEditingQuiz(null);
                                        setNewQuiz({ title: '', description: '', questions: [] });
                                    }}
                                    className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-3 rounded-lg transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* My Quizzes Section */}
                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">My Quizzes</h2>
                    {quizzes.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">📝</div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">No quizzes created yet</h3>
                            <p className="text-gray-600 mb-6">Create your first quiz to get started!</p>
                            <button
                                onClick={() => setShowCreateForm(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
                            >
                                Create Your First Quiz
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {quizzes.map((quiz) => (
                                <div key={quiz._id} className="bg-gray-50 p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-xl font-semibold text-gray-800 mb-2">{quiz.title}</h3>
                                            <p className="text-gray-600 text-sm line-clamp-2">{quiz.description}</p>
                                            <div className="mt-2 text-xs text-gray-500">
                                                {quiz.questions?.length || 0} questions
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={() => toggleLeaderboard(quiz._id)}
                                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm"
                                        >
                                            {showLeaderboard[quiz._id] ? 'Hide Leaderboard' : 'Show Leaderboard'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setEditingQuiz(quiz._id);
                                                setNewQuiz({
                                                    title: quiz.title,
                                                    description: quiz.description,
                                                    questions: quiz.questions.map(q => ({
                                                        question: q.questionText,
                                                        options: q.options,
                                                        correctAnswer: q.options[q.correctAnswer]
                                                    }))
                                                });
                                                setShowCreateForm(true);
                                                console.log('Editing quiz:', quiz._id);
                                            }}
                                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm"
                                        >
                                            Edit Quiz
                                        </button>
                                        <button
                                            onClick={() => handleDeleteQuiz(quiz._id)}
                                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm"
                                        >
                                            Delete Quiz
                                        </button>
                                    </div>
                                    {showLeaderboard[quiz._id] && (
                                        <div className="mt-4 bg-white p-4 rounded-lg border border-gray-200">
                                            <h4 className="text-lg font-semibold mb-2">Leaderboard - {quiz.title}</h4>
                                            {leaderboards[quiz._id] && leaderboards[quiz._id].length > 0 ? (
                                                <table className="w-full text-sm">
                                                    <thead>
                                                        <tr className="border-b">
                                                            <th className="text-left py-1">Rank</th>
                                                            <th className="text-left py-1">Name</th>
                                                            <th className="text-left py-1">Score</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {leaderboards[quiz._id].map((entry, index) => (
                                                            <tr key={entry._id} className="border-b">
                                                                <td className="py-1">{index + 1}</td>
                                                                <td className="py-1">{entry.student.name}</td>
                                                                <td className="py-1">{entry.correctAnswers !== undefined && entry.totalQuestions !== undefined ? `${entry.correctAnswers}/${entry.totalQuestions}` : entry.score || '0/10'}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            ) : (
                                                <p className="text-gray-500 text-sm">No attempts yet.</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
