import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    Box,
    TextField,
    Button,
    Typography,
    IconButton,
    Alert,
    Slide,
    CircularProgress,
    Fade,
    Paper
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    Close as CloseIcon,
    Person as PersonIcon,
    Email as EmailIcon,
    Lock as LockIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        backgroundColor: 'rgba(18, 18, 18, 0.8)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)',
        overflow: 'hidden',
        maxWidth: '400px',
        width: '100%',
        margin: theme.spacing(2)
    },
    '& .MuiBackdrop-root': {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)'
    }
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        transition: 'all 0.3s ease',
        '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
        },
        '&.Mui-focused': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
        }
    },
    '& input:-webkit-autofill': {
        '-webkit-box-shadow': '0 0 0 1000px rgba(169, 169, 169, 0.2) inset !important',
        '-webkit-text-fill-color': `${theme.palette.text.primary} !important`,
        'caret-color': `${theme.palette.text.primary}`,
        'border-radius': '0px',
        '-webkit-background-clip': 'text !important',
        'transition': 'background-color 5000s ease-in-out 0s'
    },
    '& input:-webkit-autofill:hover': {
        '-webkit-box-shadow': '0 0 0 1000px rgba(169, 169, 169, 0.2) inset !important'
    },
    '& input:-webkit-autofill:focus': {
        '-webkit-box-shadow': '0 0 0 1000px rgba(169, 169, 169, 0.2) inset !important'
    }
}));

const StyledButton = styled(Button)(({ theme }) => ({
    borderRadius: '8px',
    padding: theme.spacing(1.2),
    textTransform: 'none',
    fontSize: '1rem',
    fontWeight: 500,
    transition: 'all 0.3s ease',
    '&:hover': {
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)'
    }
}));

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const AuthModal = () => {
    const { isLoginModalOpen, closeLoginModal, login, register, error: authError, setError, authLoading } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [localError, setLocalError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Clear errors and success message when switching modes
    useEffect(() => {
        setLocalError('');
        setError(null);
        setSuccessMessage('');
    }, [isLogin, setError]);

    // Display either local validation error or auth error
    const displayError = localError || authError;

    const validateForm = () => {
        if (!formData.username.trim() || !formData.password.trim()) {
            setLocalError('Please fill in all required fields');
            return false;
        }

        if (!isLogin) {
            if (!formData.email.trim() || !formData.confirmPassword.trim()) {
                setLocalError('Please fill in all required fields');
                return false;
            }

            if (formData.password !== formData.confirmPassword) {
                setLocalError('Passwords do not match');
                return false;
            }
        }

        setLocalError('');
        return true;
    };

    const handleSubmit = async (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        if (!validateForm()) return;

        setSuccessMessage('');
        
        try {
            if (isLogin) {
                const success = await login(formData.username, formData.password);
                // Only close modal on successful login
                if (success) {
                    closeLoginModal();
                }
            } else {
                const response = await register(formData.username, formData.email, formData.password);
                if (response && response.requiresVerification) {
                    setSuccessMessage('Registration successful! Please check your email to verify your account before logging in.');
                    setFormData({
                        username: '',
                        email: '',
                        password: '',
                        confirmPassword: ''
                    });
                    // Don't close modal, but switch to login view after a delay
                    setTimeout(() => {
                        setIsLogin(true);
                    }, 3000);
                }
            }
        } catch (error) {
            console.error('Auth error:', error);
            // Don't close modal on error
            setLocalError(error.message || 'An error occurred');
        }
    };

    const handleClose = () => {
        closeLoginModal();
        // Reset form state
        setFormData({
            username: '',
            email: '',
            password: '',
            confirmPassword: ''
        });
        setIsLogin(true);
        setLocalError('');
        setError(null);
        setSuccessMessage('');
    };

    return (
        <StyledDialog
            open={isLoginModalOpen}
            onClose={handleClose}
            TransitionComponent={Transition}
            maxWidth="sm"
            fullWidth
        >
            <DialogContent>
                <Box sx={{ position: 'relative' }}>
                    <IconButton
                        onClick={handleClose}
                        sx={{
                            position: 'absolute',
                            right: 0,
                            top: 0,
                            color: 'grey.500'
                        }}
                    >
                        <CloseIcon />
                    </IconButton>

                    <Box 
                        component="form" 
                        onSubmit={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleSubmit();
                        }}
                        noValidate
                        sx={{ mt: 2 }}
                    >
                        <Typography variant="h5" sx={{ mb: 3, textAlign: 'center' }}>
                            {isLogin ? 'Welcome Back!' : 'Create Account'}
                        </Typography>

                        {displayError && (
                            <Fade in={!!displayError}>
                                <Alert severity="error" sx={{ mb: 2 }}>
                                    {displayError}
                                </Alert>
                            </Fade>
                        )}

                        {successMessage && (
                            <Fade in={!!successMessage}>
                                <Alert severity="success" sx={{ mb: 2 }}>
                                    {successMessage}
                                </Alert>
                            </Fade>
                        )}

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <StyledTextField
                                fullWidth
                                label="Username"
                                name="username"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                InputProps={{
                                    startAdornment: <PersonIcon sx={{ mr: 1, color: 'grey.500' }} />
                                }}
                            />

                            {!isLogin && (
                                <StyledTextField
                                    fullWidth
                                    label="Email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    InputProps={{
                                        startAdornment: <EmailIcon sx={{ mr: 1, color: 'grey.500' }} />
                                    }}
                                />
                            )}

                            <StyledTextField
                                fullWidth
                                label="Password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                InputProps={{
                                    startAdornment: <LockIcon sx={{ mr: 1, color: 'grey.500' }} />
                                }}
                            />

                            {!isLogin && (
                                <StyledTextField
                                    fullWidth
                                    label="Confirm Password"
                                    name="confirmPassword"
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    InputProps={{
                                        startAdornment: <LockIcon sx={{ mr: 1, color: 'grey.500' }} />
                                    }}
                                />
                            )}

                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                disabled={authLoading}
                                sx={{ mt: 2 }}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleSubmit();
                                }}
                            >
                                {authLoading ? (
                                    <CircularProgress size={24} color="inherit" />
                                ) : (
                                    isLogin ? 'Login' : 'Register'
                                )}
                            </Button>

                            <Button
                                onClick={() => setIsLogin(!isLogin)}
                                sx={{ mt: 1 }}
                            >
                                {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </DialogContent>
        </StyledDialog>
    );
};

export default AuthModal;
