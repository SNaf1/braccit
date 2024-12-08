import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    TextField,
    Button,
    Typography,
    Alert,
    IconButton,
    Paper,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    CircularProgress
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../../contexts/AuthContext';
import axios from '../../utils/axios';

const CreatePost = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        selectedCommunity: ''
    });
    const [images, setImages] = useState([]);
    const [error, setError] = useState('');
    const [previews, setPreviews] = useState([]);
    const [userCommunities, setUserCommunities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUserCommunities();
    }, []);

    const fetchUserCommunities = async () => {
        try {
            const response = await axios.get('/api/b/user');
            setUserCommunities(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch communities');
            setLoading(false);
        }
    };

    const { getRootProps, getInputProps } = useDropzone({
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.gif']
        },
        maxSize: 5242880, // 5MB
        maxFiles: 5,
        onDrop: (acceptedFiles) => {
            if (images.length + acceptedFiles.length > 5) {
                setError('Maximum 5 images allowed');
                return;
            }
            setImages([...images, ...acceptedFiles]);
            setPreviews([...previews, ...acceptedFiles.map(file => URL.createObjectURL(file))]);
        }
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleRemoveImage = (index) => {
        const newImages = images.filter((_, i) => i !== index);
        const newPreviews = previews.filter((_, i) => i !== index);
        setImages(newImages);
        setPreviews(newPreviews);
        // Revoke the URL to avoid memory leaks
        URL.revokeObjectURL(previews[index]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.selectedCommunity) {
            setError('Please select a community');
            return;
        }
        if (!formData.title.trim() || !formData.content.trim()) {
            setError('Title and content are required');
            return;
        }

        const postData = new FormData();
        postData.append('title', formData.title);
        postData.append('content', formData.content);
        images.forEach(image => {
            postData.append('images', image);
        });

        try {
            await axios.post(`/api/b/${formData.selectedCommunity}/posts`, postData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            navigate(`/b/${formData.selectedCommunity}`);
        } catch (err) {
            setError(err.response?.data?.error || 'Error creating post');
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!user) {
        return (
            <Box sx={{ mt: 4 }}>
                <Alert severity="warning">Please log in to create a post</Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
            <Paper sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                    Create a Post
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Select Community</InputLabel>
                        <Select
                            name="selectedCommunity"
                            value={formData.selectedCommunity}
                            onChange={handleChange}
                            label="Select Community"
                            required
                        >
                            {userCommunities.map(community => (
                                <MenuItem key={community._id} value={community.name}>
                                    {community.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField
                        fullWidth
                        label="Title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        sx={{ mb: 2 }}
                    />

                    <TextField
                        fullWidth
                        label="Content"
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        required
                        multiline
                        rows={4}
                        sx={{ mb: 2 }}
                    />

                    <Box {...getRootProps()} sx={{
                        border: '2px dashed #666',
                        borderRadius: 1,
                        p: 2,
                        mb: 2,
                        cursor: 'pointer',
                        '&:hover': {
                            borderColor: 'primary.main'
                        }
                    }}>
                        <input {...getInputProps()} />
                        <Typography>
                            Drag and drop images here, or click to select files
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            (Max 5 images, 5MB each)
                        </Typography>
                    </Box>

                    {previews.length > 0 && (
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                            {previews.map((preview, index) => (
                                <Box key={preview} sx={{ position: 'relative' }}>
                                    <img
                                        src={preview}
                                        alt={`Preview ${index + 1}`}
                                        style={{
                                            width: 100,
                                            height: 100,
                                            objectFit: 'cover',
                                            borderRadius: 4
                                        }}
                                    />
                                    <IconButton
                                        size="small"
                                        onClick={() => handleRemoveImage(index)}
                                        sx={{
                                            position: 'absolute',
                                            top: -8,
                                            right: -8,
                                            bgcolor: 'background.paper'
                                        }}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>
                            ))}
                        </Box>
                    )}

                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                    >
                        Create Post
                    </Button>
                </form>
            </Paper>
        </Box>
    );
};

export default CreatePost;
