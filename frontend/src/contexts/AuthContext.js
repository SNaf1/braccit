import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from '../utils/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authLoading, setAuthLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const initAuth = async () => {
            try {
                const token = localStorage.getItem('token');
                const userData = localStorage.getItem('user');
                
                if (token && userData) {
                    // Verify token is still valid
                    try {
                        await axios.get('/api/auth/verify');
                        setUser(JSON.parse(userData));
                    } catch (err) {
                        // Token is invalid, clear storage
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                    }
                }
            } catch (err) {
                console.error('Auth initialization error:', err);
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    const login = async (username, password) => {
        setAuthLoading(true);
        setError(null);
        try {
            const response = await axios.post('/api/auth/login', { username, password });
            const { token, user: userData } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            return true;
        } catch (err) {
            console.error('Login error:', err.response?.data);
            setError(err.response?.data?.error || 'Invalid username or password');
            return false;
        } finally {
            setAuthLoading(false);
        }
    };

    const register = async (username, email, password) => {
        setAuthLoading(true);
        setError(null);
        try {
            const response = await axios.post('/api/auth/register', { username, email, password });
            const { token, user: userData } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            return true;
        } catch (err) {
            console.error('Registration error:', err.response?.data);
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
            return false;
        } finally {
            setAuthLoading(false);
        }
    };

    const logout = async () => {
        try {
            // Call logout endpoint if you have one
            await axios.post('/api/auth/logout');
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
            setError(null);
        }
    };

    const value = {
        user,
        login,
        logout,
        register,
        loading,
        authLoading,
        error,
        setError
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
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
