import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    Chip,
    CircularProgress,
    Alert,
    Paper,
    Divider,
    Button,
    Stack
} from '@mui/material';
import axios from '../../utils/axios';

const CourseSuggestions = () => {
    const [suggestions, setSuggestions] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchSuggestions();
    }, []);

    const fetchSuggestions = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/courses/suggestions');
            console.log('Course suggestions response:', response.data);
            setSuggestions(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching course suggestions:', err.response || err);
            let errorMessage = 'Failed to fetch course suggestions';
            
            if (err.response) {
                errorMessage = `Server Error: ${err.response.data?.error || err.response.statusText}`;
                if (err.response.data?.details) {
                    errorMessage += `\nDetails: ${err.response.data.details}`;
                }
            } else if (err.request) {
                errorMessage = 'Network Error: Could not reach the server';
            } else {
                errorMessage = `Error: ${err.message}`;
            }
            
            setError(errorMessage);
            setSuggestions(null);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
                <CircularProgress />
                <Typography variant="body1" sx={{ mt: 2 }}>
                    Loading course suggestions...
                </Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Alert 
                severity="error" 
                sx={{ mt: 2 }}
                action={
                    <Button color="inherit" size="small" onClick={fetchSuggestions}>
                        Retry
                    </Button>
                }
            >
                <Typography variant="subtitle1" gutterBottom>
                    Error Loading Courses
                </Typography>
                <Typography variant="body2">
                    {error}
                </Typography>
            </Alert>
        );
    }

    if (!suggestions || !suggestions.suggestedCourses || suggestions.suggestedCourses.length === 0) {
        return (
            <Paper sx={{ p: 3, mt: 2, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                    No course suggestions available at this time
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    You might have completed all available courses or need to complete prerequisites first.
                </Typography>
            </Paper>
        );
    }

    return (
        <Box sx={{ mt: 2 }}>
            {/* Current Status */}
            {suggestions.currentStatus && (
                <Paper sx={{ p: 2, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Current Status
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="subtitle2" color="text.secondary">
                                CGPA
                            </Typography>
                            <Typography variant="h6">
                                {suggestions.currentStatus.cgpa?.toFixed(2) || 'N/A'}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="subtitle2" color="text.secondary">
                                Current Courses
                            </Typography>
                            <Typography variant="h6">
                                {suggestions.currentStatus.currentCourseCount || 0}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="subtitle2" color="text.secondary">
                                Maximum Courses
                            </Typography>
                            <Typography variant="h6">
                                {suggestions.currentStatus.maxCourses || 'N/A'}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="subtitle2" color="text.secondary">
                                Status
                            </Typography>
                            <Chip 
                                label={suggestions.currentStatus.canTakeMore ? "Can take more courses" : "Maximum courses reached"}
                                color={suggestions.currentStatus.canTakeMore ? "success" : "error"}
                                size="small"
                            />
                        </Grid>
                    </Grid>
                </Paper>
            )}

            {/* Course Suggestions */}
            <Typography variant="h5" gutterBottom>
                Suggested Courses
            </Typography>
            
            <Grid container spacing={2}>
                {suggestions.suggestedCourses.map((course) => (
                    <Grid item xs={12} md={6} key={course.code}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="h6" component="div">
                                        {course.code}
                                    </Typography>
                                    <Stack direction="row" spacing={1}>
                                        <Chip 
                                            label={`${course.credits} credits`}
                                            size="small"
                                            color="primary"
                                        />
                                        {course.isRequired && (
                                            <Chip 
                                                label="Required"
                                                size="small"
                                                color="secondary"
                                            />
                                        )}
                                    </Stack>
                                </Box>
                                <Typography variant="subtitle1" gutterBottom>
                                    {course.name}
                                </Typography>
                                {course.description && (
                                    <Typography variant="body2" color="text.secondary" paragraph>
                                        {course.description}
                                    </Typography>
                                )}
                                {course.prerequisites && course.prerequisites.length > 0 && (
                                    <Box sx={{ mt: 1 }}>
                                        <Typography variant="caption" color="text.secondary">
                                            Prerequisites: {course.prerequisites.join(', ')}
                                        </Typography>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default CourseSuggestions;
