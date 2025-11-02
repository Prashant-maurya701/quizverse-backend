import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import AdminDashboard from './components/AdminDashboard';
import AllQuizzes from './components/AllQuizzes';
import QuizShow from './components/QuizShow';
import QuizList from './components/QuizList';
import QuizAttempt from './components/QuizAttempt';
import Leaderboard from './components/Leaderboard';


const ProtectedRoute = ({ children, requireAdmin = false }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (requireAdmin && user.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return children;
};

const AppRoutes = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <Navbar />
            <main className="container mx-auto px-4 py-8 max-w-7xl">
                <Routes>
                    <Route
                        path="/"
                        element={
                            user ? (
                                user.role === 'admin' ? <Navigate to="/admin" replace /> : <QuizList />
                            ) : (
                                <Navigate to="/login" replace />
                            )
                        }
                    />
                    <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
                    <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute requireAdmin={true}>
                                <AdminDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/all-quizzes"
                        element={
                            <ProtectedRoute>
                                <AllQuizzes />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/quiz/:id"
                        element={
                            <ProtectedRoute>
                                <QuizAttempt />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/quiz-show/:id"
                        element={
                            <ProtectedRoute>
                                <QuizShow />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/leaderboard/:quizId"
                        element={
                            <ProtectedRoute>
                                <Leaderboard />
                            </ProtectedRoute>
                        }
                    />

                </Routes>
            </main>
        </div>
    );
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <AppRoutes />
            </Router>
        </AuthProvider>
    );
}

export default App;
