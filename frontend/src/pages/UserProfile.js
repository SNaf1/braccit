import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    Avatar,
    Box,
    Button,
    TextField,
    CircularProgress,
    Alert,
    IconButton
} from '@mui/material';
import { Edit as EditIcon, PhotoCamera } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from '../utils/axios';

const UserProfile = () => {
    const { username } = useParams();
    const { user: currentUser, updateUser } = useAuth();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [profileData, setProfileData] = useState({
        fullName: '',
        bio: '',
        email: ''
    });
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchUserProfile();
    }, [username]);

    const fetchUserProfile = async () => {
        try {
            const response = await axios.get(`/api/users/${username}`);
            setUser(response.data);
            setProfileData({
                fullName: response.data.fullName || '',
                bio: response.data.bio || '',
                email: response.data.email || ''
            });
        } catch (err) {
            setError('Failed to load user profile');
            console.error('Error fetching profile:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleProfilePictureChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('profilePicture', file);

        try {
            console.log('Uploading profile picture...');
            const response = await axios.put('/api/users/profile-picture', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log('Profile picture upload response:', response.data);

            // Update local state
            setUser(response.data.user);
            
            // Update auth context
            if (currentUser && currentUser.username === username) {
                updateUser(response.data.user);
                // Update localStorage
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }

            setMessage({ type: 'success', text: 'Profile picture updated successfully' });
        } catch (err) {
            console.error('Error updating profile picture:', err.response?.data || err.message);
            setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to update profile picture' });
        }
    };

    const handleProfileUpdate = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put('/api/users/profile', profileData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setUser(response.data);
            setEditMode(false);
            setMessage({ type: 'success', text: 'Profile updated successfully' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to update profile' });
            console.error('Error updating profile:', err);
        }
    };

    if (loading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Container>
        );
    }

    if (error) {
        return (
            <Container sx={{ mt: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    const isOwnProfile = currentUser && currentUser.username === username;

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                    <Box sx={{ position: 'relative' }}>
                        <Avatar
                            src={user?.profilePicture}
                            sx={{ width: 120, height: 120 }}
                            imgProps={{
                                style: {
                                    objectFit: 'cover',
                                    width: '100%',
                                    height: '100%'
                                }
                            }}
                        >
                            {user?.username?.[0]?.toUpperCase()}
                        </Avatar>
                        {isOwnProfile && (
                            <IconButton
                                color="primary"
                                aria-label="upload picture"
                                component="label"
                                sx={{
                                    position: 'absolute',
                                    bottom: 0,
                                    right: 0,
                                    backgroundColor: 'background.paper'
                                }}
                            >
                                <input
                                    hidden
                                    accept="image/*"
                                    type="file"
                                    onChange={handleProfilePictureChange}
                                />
                                <PhotoCamera />
                            </IconButton>
                        )}
                    </Box>
                    <Box sx={{ ml: 3, flex: 1 }}>
                        <Typography variant="h4" gutterBottom>
                            {user?.username}
                        </Typography>
                        {isOwnProfile && !editMode && (
                            <Button
                                startIcon={<EditIcon />}
                                onClick={() => setEditMode(true)}
                            >
                                Edit Profile
                            </Button>
                        )}
                    </Box>
                </Box>

                {message.text && (
                    <Alert severity={message.type} sx={{ mb: 2 }}>
                        {message.text}
                    </Alert>
                )}

                {editMode ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="Full Name"
                            value={profileData.fullName}
                            onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label="Email"
                            value={profileData.email}
                            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                            fullWidth
                            type="email"
                        />
                        <TextField
                            label="Bio"
                            value={profileData.bio}
                            onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                            fullWidth
                            multiline
                            rows={4}
                        />
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                            <Button onClick={() => setEditMode(false)}>
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleProfileUpdate}
                            >
                                Save Changes
                            </Button>
                        </Box>
                    </Box>
                ) : (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Full Name
                        </Typography>
                        <Typography paragraph>
                            {user?.fullName || 'Not set'}
                        </Typography>

                        <Typography variant="h6" gutterBottom>
                            Email
                        </Typography>
                        <Typography paragraph>
                            {user?.email}
                        </Typography>

                        <Typography variant="h6" gutterBottom>
                            Bio
                        </Typography>
                        <Typography paragraph>
                            {user?.bio || 'No bio yet'}
                        </Typography>
                    </Box>
                )}
            </Paper>
        </Container>
    );
};

export default UserProfile;
