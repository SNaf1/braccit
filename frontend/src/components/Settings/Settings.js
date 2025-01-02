import React, { useState } from 'react';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Box,
    Alert,
    Divider,
    List,
    ListItem,
    ListItemIcon,
    ListItemText
} from '@mui/material';
import {
    Check as CheckIcon,
    Clear as ClearIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import axios from '../../utils/axios';  // Updated import

const Settings = () => {
    const { user } = useAuth();
    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });
    const [message, setMessage] = useState({ type: '', text: '' });

    // Password validation
    const passwordRequirements = [
        { label: 'At least 8 characters', test: (pass) => pass.length >= 8 },
        { label: 'Contains a number', test: (pass) => /\d/.test(pass) },
        { label: 'Contains an uppercase letter', test: (pass) => /[A-Z]/.test(pass) },
        { label: 'Contains a lowercase letter', test: (pass) => /[a-z]/.test(pass) },
        { label: 'Contains a special character', test: (pass) => /[!@#$%^&*(),.?":{}|<>]/.test(pass) }
    ];

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (passwordData.newPassword !== passwordData.confirmNewPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        // Check password requirements
        const failedRequirements = passwordRequirements.filter(
            req => !req.test(passwordData.newPassword)
        );

        if (failedRequirements.length > 0) {
            setMessage({ type: 'error', text: 'Please meet all password requirements' });
            return;
        }

        if (passwordData.newPassword === passwordData.oldPassword) {
            setMessage({ type: 'error', text: 'New password cannot be the same as current password' });
            return;
        }

        try {
            console.log('Attempting password change...');
            const res = await axios.put('/api/auth/change-password', {
                oldPassword: passwordData.oldPassword,
                newPassword: passwordData.newPassword
            });

            console.log('Password change response:', res.data);

            setMessage({ type: 'success', text: 'Password updated successfully' });
            setPasswordData({
                oldPassword: '',
                newPassword: '',
                confirmNewPassword: ''
            });
        } catch (err) {
            console.error('Password change error:', {
                status: err.response?.status,
                data: err.response?.data,
                error: err.message
            });
            setMessage({
                type: 'error',
                text: err.response?.data?.error || 'Failed to change password'
            });
        }
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Paper
                sx={{
                    p: 4,
                    backgroundColor: '#1a1a1b',
                    color: 'white',
                    borderRadius: 2
                }}
            >
                <Typography variant="h4" sx={{ mb: 4, color: '#2196f3' }}>
                    Account Settings
                </Typography>

                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Account Information
                    </Typography>
                    <Typography>
                        Username: <strong>{user?.username}</strong>
                    </Typography>
                    <Typography>
                        Email: <strong>{user?.email}</strong>
                    </Typography>
                </Box>

                <Divider sx={{ my: 4, borderColor: 'rgba(255, 255, 255, 0.12)' }} />

                <Typography variant="h6" sx={{ mb: 3 }}>
                    Change Password
                </Typography>

                {message.text && (
                    <Alert
                        severity={message.type}
                        sx={{ mb: 3 }}
                        onClose={() => setMessage({ type: '', text: '' })}
                    >
                        {message.text}
                    </Alert>
                )}

                <Box component="form" onSubmit={handlePasswordChange}>
                    <TextField
                        fullWidth
                        type="password"
                        label="Current Password"
                        value={passwordData.oldPassword}
                        onChange={(e) =>
                            setPasswordData({
                                ...passwordData,
                                oldPassword: e.target.value
                            })
                        }
                        margin="normal"
                        required
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                    borderColor: 'rgba(255, 255, 255, 0.23)'
                                },
                                '&:hover fieldset': {
                                    borderColor: '#2196f3'
                                }
                            },
                            '& .MuiInputLabel-root': {
                                color: 'rgba(255, 255, 255, 0.7)'
                            },
                            '& .MuiInputBase-input': {
                                color: 'white'
                            }
                        }}
                    />
                    <TextField
                        fullWidth
                        type="password"
                        label="New Password"
                        value={passwordData.newPassword}
                        onChange={(e) =>
                            setPasswordData({
                                ...passwordData,
                                newPassword: e.target.value
                            })
                        }
                        margin="normal"
                        required
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                    borderColor: 'rgba(255, 255, 255, 0.23)'
                                },
                                '&:hover fieldset': {
                                    borderColor: '#2196f3'
                                }
                            },
                            '& .MuiInputLabel-root': {
                                color: 'rgba(255, 255, 255, 0.7)'
                            },
                            '& .MuiInputBase-input': {
                                color: 'white'
                            }
                        }}
                    />
                    <TextField
                        fullWidth
                        type="password"
                        label="Confirm New Password"
                        value={passwordData.confirmNewPassword}
                        onChange={(e) =>
                            setPasswordData({
                                ...passwordData,
                                confirmNewPassword: e.target.value
                            })
                        }
                        margin="normal"
                        required
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                    borderColor: 'rgba(255, 255, 255, 0.23)'
                                },
                                '&:hover fieldset': {
                                    borderColor: '#2196f3'
                                }
                            },
                            '& .MuiInputLabel-root': {
                                color: 'rgba(255, 255, 255, 0.7)'
                            },
                            '& .MuiInputBase-input': {
                                color: 'white'
                            }
                        }}
                    />
                    <Box sx={{ mt: 2, mb: 1 }}>
                        <Typography variant="subtitle2" sx={{ color: '#90caf9', mb: 1 }}>
                            Password Requirements:
                        </Typography>
                        <List dense>
                            {passwordRequirements.map((req, index) => (
                                <ListItem key={index} sx={{ py: 0 }}>
                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                        {req.test(passwordData.newPassword) ? (
                                            <CheckIcon sx={{ color: '#4caf50', fontSize: 20 }} />
                                        ) : (
                                            <ClearIcon sx={{ color: '#ff1744', fontSize: 20 }} />
                                        )}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={req.label}
                                        sx={{
                                            '& .MuiListItemText-primary': {
                                                color: req.test(passwordData.newPassword)
                                                    ? '#4caf50'
                                                    : '#ff1744',
                                                fontSize: '0.875rem'
                                            }
                                        }}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                    <Button
                        type="submit"
                        variant="contained"
                        sx={{
                            mt: 3,
                            backgroundColor: '#2196f3',
                            '&:hover': {
                                backgroundColor: '#1565c0'
                            }
                        }}
                    >
                        Change Password
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default Settings;
