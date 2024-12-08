import React, { useState } from 'react';
import {
    Paper,
    TextField,
    Button,
    Switch,
    FormControlLabel,
    Box,
    Typography,
    Alert,
    Container
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import axios from '../../utils/axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const CreateCommunity = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        isPrivate: false
    });
    const [bannerImage, setBannerImage] = useState(null);
    const [error, setError] = useState('');
    const [previewUrl, setPreviewUrl] = useState('');

    const { getRootProps, getInputProps } = useDropzone({
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.gif']
        },
        maxSize: 5242880, // 5MB
        multiple: false,
        onDrop: (acceptedFiles) => {
            if (acceptedFiles.length > 0) {
                setBannerImage(acceptedFiles[0]);
                setPreviewUrl(URL.createObjectURL(acceptedFiles[0]));
            }
        }
    });

    const handleChange = (e) => {
        const { name, value, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'isPrivate' ? checked : value
        }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!user) {
            setError('You must be logged in to create a community');
            return;
        }

        if (!formData.name.trim()) {
            setError('Community name is required');
            return;
        }

        if (!formData.description.trim()) {
            setError('Description is required');
            return;
        }

        const form = new FormData();
        form.append('name', formData.name.trim());
        form.append('description', formData.description.trim());
        form.append('isPrivate', formData.isPrivate);
        if (bannerImage) {
            form.append('bannerImage', bannerImage);
        }

        try {
            const response = await axios.post('/api/b', form, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            navigate(`/b/${response.data.name}`);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create community');
        }
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Create a Community
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Community Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        margin="normal"
                        helperText="Community names cannot be changed"
                    />

                    <TextField
                        fullWidth
                        label="Description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        margin="normal"
                        multiline
                        rows={4}
                    />

                    <FormControlLabel
                        control={
                            <Switch
                                checked={formData.isPrivate}
                                onChange={handleChange}
                                name="isPrivate"
                            />
                        }
                        label="Private Community"
                        sx={{ my: 2 }}
                    />

                    <Box
                        {...getRootProps()}
                        sx={{
                            border: '2px dashed #666',
                            borderRadius: 1,
                            p: 3,
                            textAlign: 'center',
                            cursor: 'pointer',
                            mb: 2,
                            '&:hover': {
                                borderColor: 'primary.main'
                            }
                        }}
                    >
                        <input {...getInputProps()} />
                        {previewUrl ? (
                            <Box
                                component="img"
                                src={previewUrl}
                                alt="Banner preview"
                                sx={{
                                    maxWidth: '100%',
                                    maxHeight: '200px',
                                    objectFit: 'cover'
                                }}
                            />
                        ) : (
                            <Typography>
                                Drag and drop a banner image here, or click to select one
                            </Typography>
                        )}
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                        <Button
                            variant="outlined"
                            onClick={() => navigate('/')}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                        >
                            Create Community
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Container>
    );
};

export default CreateCommunity;
