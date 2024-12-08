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

const AuthModal = ({ open, onClose }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [localError, setLocalError] = useState('');
    const { login, register, error: authError, setError, authLoading } = useAuth();

    // Clear errors when switching modes
    useEffect(() => {
        setLocalError('');
        setError(null);
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
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        setLocalError('');
        setError(null);
        
        try {
            let success;
            if (isLogin) {
                success = await login(formData.username, formData.password);
            } else {
                if (!formData.email.trim()) {
                    setLocalError('Email is required');
                    setIsLoading(false);
                    return;
                }
                // Basic email validation
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(formData.email)) {
                    setLocalError('Please enter a valid email address');
                    setIsLoading(false);
                    return;
                }
                if (formData.password.length < 6) {
                    setLocalError('Password must be at least 6 characters long');
                    setIsLoading(false);
                    return;
                }
                success = await register(formData.username, formData.email, formData.password);
            }
            
            if (success) {
                handleClose();
            }
        } catch (err) {
            console.error('Auth error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setLocalError('');
        setError(null);
    };

    const handleClose = () => {
        setFormData({
            username: '',
            email: '',
            password: '',
            confirmPassword: ''
        });
        setLocalError('');
        setError(null);
        onClose();
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setFormData({
            username: '',
            email: '',
            password: '',
            confirmPassword: ''
        });
        setLocalError('');
        setError(null);
    };

    return (
        <StyledDialog
            open={open}
            TransitionComponent={Transition}
            keepMounted
            onClose={handleClose}
            aria-describedby="auth-dialog"
        >
            <Box sx={{ position: 'relative', p: 3, minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
                <IconButton
                    aria-label="close"
                    onClick={handleClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: 'grey.500',
                    }}
                >
                    <CloseIcon />
                </IconButton>

                <Typography variant="h5" component="h2" gutterBottom align="center" sx={{ mb: 3, fontWeight: 600 }}>
                    {isLogin ? 'Welcome Back!' : 'Create Account'}
                </Typography>

                <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <StyledTextField
                            fullWidth
                            name="username"
                            label="Username"
                            value={formData.username}
                            onChange={handleInputChange}
                            InputProps={{
                                startAdornment: <PersonIcon sx={{ mr: 1, color: 'action.active' }} />
                            }}
                        />

                        {!isLogin && (
                            <Fade in={!isLogin}>
                                <StyledTextField
                                    fullWidth
                                    name="email"
                                    label="Email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    InputProps={{
                                        startAdornment: <EmailIcon sx={{ mr: 1, color: 'action.active' }} />
                                    }}
                                />
                            </Fade>
                        )}

                        <StyledTextField
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            InputProps={{
                                startAdornment: <LockIcon sx={{ mr: 1, color: 'action.active' }} />
                            }}
                        />

                        {!isLogin && (
                            <Fade in={!isLogin}>
                                <StyledTextField
                                    fullWidth
                                    name="confirmPassword"
                                    label="Confirm Password"
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    InputProps={{
                                        startAdornment: <LockIcon sx={{ mr: 1, color: 'action.active' }} />
                                    }}
                                />
                            </Fade>
                        )}

                        {displayError && (
                            <Alert severity="error" sx={{ mt: 1 }}>
                                {displayError}
                            </Alert>
                        )}

                        <Box sx={{ mt: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <StyledButton
                                fullWidth
                                variant="contained"
                                color="primary"
                                type="submit"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <CircularProgress size={24} color="inherit" />
                                ) : (
                                    isLogin ? 'Sign In' : 'Create Account'
                                )}
                            </StyledButton>

                            <Button
                                color="primary"
                                onClick={toggleMode}
                                sx={{ textTransform: 'none' }}
                            >
                                {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
                            </Button>
                        </Box>
                    </Box>
                </form>
            </Box>
        </StyledDialog>
    );
};

export default AuthModal;
