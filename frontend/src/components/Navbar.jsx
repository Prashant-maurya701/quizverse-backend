import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import React, { useState } from 'react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <nav className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center py-4">
                    <Link to="/" className="text-2xl font-bold hover:text-blue-200 transition-colors">
                        QuizVerse
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-6">
                        {user ? (
                            <>
                                <span className="text-sm">Welcome, {user.name}</span>
                                {user.role === 'admin' && (
                                    <>
                                        <Link
                                            to="/admin"
                                            className="hover:text-blue-200 transition-colors font-medium"
                                        >
                                            Admin Dashboard
                                        </Link>
                                        <Link
                                            to="/all-quizzes"
                                            className="hover:text-blue-200 transition-colors font-medium"
                                        >
                                            All Quizzes
                                        </Link>
                                    </>
                                )}
                                <button
                                    onClick={handleLogout}
                                    className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors font-medium"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="hover:text-blue-200 transition-colors font-medium"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg transition-colors font-medium"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={toggleMenu}
                        className="md:hidden focus:outline-none"
                        aria-label="Toggle menu"
                    >
                        <div className="w-6 h-6 flex flex-col justify-center items-center">
                            <span className={`block w-5 h-0.5 bg-white transition-transform ${isMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-1'}`}></span>
                            <span className={`block w-5 h-0.5 bg-white transition-opacity ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                            <span className={`block w-5 h-0.5 bg-white transition-transform ${isMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-1'}`}></span>
                        </div>
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden pb-4 border-t border-blue-500 mt-4">
                        <div className="flex flex-col space-y-3 pt-4">
                            {user ? (
                                <>
                                    <span className="text-sm text-center">Welcome, {user.name}</span>
                                    {user.role === 'admin' && (
                                        <>
                                            <Link
                                                to="/admin"
                                                className="hover:text-blue-200 transition-colors font-medium text-center py-2"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                Admin Dashboard
                                            </Link>
                                            <Link
                                                to="/all-quizzes"
                                                className="hover:text-blue-200 transition-colors font-medium text-center py-2"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                All Quizzes
                                            </Link>
                                        </>
                                    )}
                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setIsMenuOpen(false);
                                        }}
                                        className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors font-medium mx-auto"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        className="hover:text-blue-200 transition-colors font-medium text-center py-2"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg transition-colors font-medium text-center"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Register
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
