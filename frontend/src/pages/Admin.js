import React from 'react';
import { Container, Typography } from '@mui/material';
import PdfUpload from '../components/Admin/PdfUpload';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const Admin = () => {
    const { user } = useAuth();

    // Check if user is admin
    if (!user?.isAdmin) {
        return <Navigate to="/" replace />;
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                Admin Dashboard
            </Typography>
            <PdfUpload />
        </Container>
    );
};

export default Admin;
