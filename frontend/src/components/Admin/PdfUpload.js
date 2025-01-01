import React, { useState } from 'react';
import {
    Box,
    Button,
    Paper,
    Typography,
    CircularProgress,
    Alert
} from '@mui/material';
import { Upload as UploadIcon } from '@mui/icons-material';
import axios from '../../utils/axios';

const PdfUpload = () => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile && selectedFile.type === 'application/pdf') {
            setFile(selectedFile);
            setError('');
        } else {
            setFile(null);
            setError('Please select a valid PDF file');
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file first');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        const formData = new FormData();
        formData.append('pdfFile', file);

        try {
            const response = await axios.post('/api/exam/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setSuccess('PDF uploaded and processed successfully!');
            setFile(null);
            // Reset the file input
            const fileInput = document.querySelector('input[type="file"]');
            if (fileInput) fileInput.value = '';
        } catch (error) {
            console.error('Upload error:', error);
            setError(error.response?.data?.error || 'Error uploading file');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 4 }}>
            <Typography variant="h6" gutterBottom>
                Upload Exam Schedule PDF
            </Typography>
            
            <Box sx={{ mt: 2 }}>
                <input
                    accept="application/pdf"
                    style={{ display: 'none' }}
                    id="pdf-upload"
                    type="file"
                    onChange={handleFileChange}
                />
                <label htmlFor="pdf-upload">
                    <Button
                        variant="outlined"
                        component="span"
                        startIcon={<UploadIcon />}
                        disabled={loading}
                    >
                        Select PDF
                    </Button>
                </label>
                
                {file && (
                    <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                        Selected file: {file.name}
                    </Typography>
                )}
            </Box>

            {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" sx={{ mt: 2 }}>
                    {success}
                </Alert>
            )}

            <Box sx={{ mt: 3 }}>
                <Button
                    variant="contained"
                    onClick={handleUpload}
                    disabled={!file || loading}
                    startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                    {loading ? 'Uploading...' : 'Upload PDF'}
                </Button>
            </Box>
        </Paper>
    );
};

export default PdfUpload;
