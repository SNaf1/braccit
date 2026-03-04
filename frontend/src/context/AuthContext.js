import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    useEffect(() => {
        // Check if user is logged in on page load
        const token = localStorage.getItem('token');
        if (token) {
            loadUser(token);
        } else {
            setLoading(false);
        }
    }, []);

    const loadUser = async (token) => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };
            const res = await axios.get('http://localhost:5000/api/auth/me', config);
            setUser(res.data);
        } catch (err) {
            localStorage.removeItem('token');
            setError(err.response?.data?.error || 'Error loading user');
        } finally {
            setLoading(false);
        }
    };

    const openLoginModal = () => {
        setIsLoginModalOpen(true);
    };

    const closeLoginModal = () => {
        setIsLoginModalOpen(false);
    };

    const login = async (email, password) => {
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', {
                email,
                password
            });
            localStorage.setItem('token', res.data.token);
            setUser(res.data.user);
            setError(null);
            closeLoginModal(); // Close modal on successful login
            return true;
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
            return false;
        }
    };

    const register = async (username, email, password) => {
        try {
            const res = await axios.post('http://localhost:5000/api/auth/register', {
                username,
                email,
                password
            });
            localStorage.setItem('token', res.data.token);
            setUser(res.data.user);
            setError(null);
            closeLoginModal(); // Close modal on successful registration
            return true;
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const updateProfile = async (profileData) => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };
            const res = await axios.put('http://localhost:5000/api/auth/profile', profileData, config);
            setUser(res.data);
            setError(null);
            return true;
        } catch (err) {
            setError(err.response?.data?.error || 'Profile update failed');
            return false;
        }
    };

    const forgotPassword = async (email) => {
        try {
            await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
            setError(null);
            return true;
        } catch (err) {
            setError(err.response?.data?.error || 'Password reset request failed');
            return false;
        }
    };

    const resetPassword = async (token, password) => {
        try {
            await axios.put(`http://localhost:5000/api/auth/reset-password/${token}`, { password });
            setError(null);
            return true;
        } catch (err) {
            setError(err.response?.data?.error || 'Password reset failed');
            return false;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                error,
                setError,
                login,
                register,
                logout,
                updateProfile,
                forgotPassword,
                resetPassword,
                isLoginModalOpen,
                openLoginModal,
                closeLoginModal
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
