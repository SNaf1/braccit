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
    Button
} from '@mui/material';
import axios from '../../utils/axios';

const CourseSuggestions = () => {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchSuggestions();
    }, []);

    const fetchSuggestions = async () => {
        try {
            console.log('Fetching course suggestions...');
            
            // First, check if courses exist
            const coursesResponse = await axios.get('/api/courses');
            console.log('All courses:', coursesResponse.data);

            // Then get user's course status
            const statusResponse = await axios.get('/api/courses/my-courses');
            console.log('User course status:', statusResponse.data);

            // Finally get suggestions
            const suggestionsResponse = await axios.get('/api/courses/suggestions');
            console.log('Course suggestions:', suggestionsResponse.data);
            
            setSuggestions(suggestionsResponse.data);
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
            setSuggestions([]);
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

    if (!suggestions || suggestions.length === 0) {
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

    // Group courses by semester
    const groupedSuggestions = suggestions.reduce((acc, course) => {
        if (!acc[course.semester]) {
            acc[course.semester] = [];
        }
        acc[course.semester].push(course);
        return acc;
    }, {});

    return (
        <Box sx={{ mt: 2 }}>
            <Typography variant="h5" gutterBottom>
                Suggested Courses
            </Typography>
            
            {Object.entries(groupedSuggestions).sort((a, b) => a[0] - b[0]).map(([semester, courses]) => (
                <Box key={semester} sx={{ mb: 4 }}>
                    <Typography variant="h6" color="primary" gutterBottom>
                        Semester {semester}
                    </Typography>
                    <Grid container spacing={2}>
                        {courses.map((course) => (
                            <Grid item xs={12} md={6} key={course.code}>
                                <Card>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="h6" component="div">
                                                {course.code}
                                            </Typography>
                                            <Chip 
                                                label={`${course.credits} credits`}
                                                size="small"
                                                color="primary"
                                            />
                                        </Box>
                                        <Typography variant="subtitle1" gutterBottom>
                                            {course.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" paragraph>
                                            {course.description}
                                        </Typography>
                                        {course.prerequisites && course.prerequisites.length > 0 && (
                                            <>
                                                <Divider sx={{ my: 1 }} />
                                                <Typography variant="body2" color="text.secondary">
                                                    Prerequisites:
                                                </Typography>
                                                <Box sx={{ mt: 1 }}>
                                                    {course.prerequisites.map((prereq) => (
                                                        <Chip
                                                            key={prereq}
                                                            label={prereq}
                                                            size="small"
                                                            sx={{ mr: 0.5, mb: 0.5 }}
                                                        />
                                                    ))}
                                                </Box>
                                            </>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            ))}
        </Box>
    );
};

export default CourseSuggestions;
