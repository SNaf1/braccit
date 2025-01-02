import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from '../utils/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authLoading, setAuthLoading] = useState(false);
    const [error, setError] = useState('');
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    // Initialize authentication state from localStorage
    useEffect(() => {
        const initializeAuth = async () => {
            const token = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');
            
            if (token && storedUser) {
                try {
                    // Set authorization header
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    
                    // Set the stored user immediately
                    const parsedUser = JSON.parse(storedUser);
                    setUser(parsedUser);
                    
                    // Verify token and get fresh user data
                    const response = await axios.get('/api/auth/me');
                    if (response.data) {
                        setUser(response.data);
                        localStorage.setItem('user', JSON.stringify(response.data));
                    } else {
                        throw new Error('No user data received');
                    }
                } catch (err) {
                    console.error('Auth initialization error:', err);
                    handleLogout();
                }
            }
            setLoading(false);
        };

        initializeAuth();
    }, []);

    const openLoginModal = () => setIsLoginModalOpen(true);
    const closeLoginModal = () => setIsLoginModalOpen(false);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
    };

    const login = async (username, password) => {
        setAuthLoading(true);
        setError('');
        try {
            const response = await axios.post('/api/auth/login', { username, password });
            
            if (response.data.needsVerification) {
                setError('Please verify your email before logging in');
                return false;
            }

            const { token, user: userData } = response.data;
            
            // Set token in axios headers
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            // Save to localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            
            // Update state
            setUser(userData);
            closeLoginModal();

            // Get fresh user data
            try {
                const freshUserResponse = await axios.get('/api/auth/me');
                if (freshUserResponse.data) {
                    setUser(freshUserResponse.data);
                    localStorage.setItem('user', JSON.stringify(freshUserResponse.data));
                }
            } catch (err) {
                console.error('Error fetching fresh user data:', err);
            }

            return true;
        } catch (err) {
            console.error('Login error:', err.response?.data);
            setError(err.response?.data?.error || 'Login failed. Please try again.');
            return false;
        } finally {
            setAuthLoading(false);
        }
    };

    const register = async (username, email, password) => {
        setAuthLoading(true);
        setError('');
        try {
            const response = await axios.post('/api/auth/register', { username, email, password });
            if (response.data.requiresVerification) {
                return response.data;
            }
            return false;
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
            await axios.post('/api/auth/logout');
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            handleLogout();
        }
    };

    const updateUser = async (userData) => {
        try {
            // Update the user in state and localStorage
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));

            // Get fresh user data from the server
            const response = await axios.get('/api/auth/me');
            if (response.data) {
                setUser(response.data);
                localStorage.setItem('user', JSON.stringify(response.data));
            }
        } catch (err) {
            console.error('Error updating user:', err);
        }
    };

    const value = {
        user,
        loading,
        authLoading,
        error,
        setError,
        isLoginModalOpen,
        login,
        register,
        logout,
        openLoginModal,
        closeLoginModal,
        updateUser
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
