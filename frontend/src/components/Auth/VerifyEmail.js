import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, Alert, Button } from '@mui/material';
import axios from '../../utils/axios';
import { useAuth } from '../../contexts/AuthContext';

const VerifyEmail = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const { openLoginModal } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verifyEmail = async () => {
            if (!token) {
                setError('No verification token provided');
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(`/api/auth/verify-email/${token}`);
                setMessage(response.data.message);
                setError('');
            } catch (error) {
                setMessage('');
                const errorMessage = error.response?.data?.error || 'Failed to verify email';
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        verifyEmail();
    }, [token]);

    const handleNavigate = () => {
        navigate('/');  // Navigate to home page
        openLoginModal(); // Open the login modal
    };

    const renderContent = () => {
        if (loading) {
            return (
                <>
                    <CircularProgress />
                    <Typography variant="body1" sx={{ mt: 2 }}>
                        Verifying your email...
                    </Typography>
                </>
            );
        }

        return (
            <>
                {message ? (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        {message}
                    </Alert>
                ) : (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                <Button 
                    variant="contained" 
                    onClick={handleNavigate}
                    sx={{ mt: 2 }}
                >
                    Go to Login
                </Button>
            </>
        );
    };

    return (
        <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            mt: 4, 
            gap: 2,
            padding: 3
        }}>
            {renderContent()}
        </Box>
    );
};

export default VerifyEmail;