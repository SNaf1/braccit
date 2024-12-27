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
    Divider
} from '@mui/material';
import axios from '../../utils/axios';

const AllCourses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            console.log('Fetching all courses...');
            const response = await axios.get('/api/courses');
            console.log('Courses response:', response.data);
            setCourses(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching courses:', err.response || err);
            let errorMessage = 'Failed to fetch courses';
            
            if (err.response) {
                errorMessage = `Server Error: ${err.response.data?.error || err.response.statusText}`;
                if (err.response.data?.details) {
                    errorMessage += `\nDetails: ${err.response.data.details}`;
                }
            }
            
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mb: 2 }}>
                {error}
            </Alert>
        );
    }

    if (!courses.length) {
        return (
            <Alert severity="info" sx={{ mb: 2 }}>
                No courses available.
            </Alert>
        );
    }

    // Group courses by semester
    const coursesBySemester = courses.reduce((acc, course) => {
        const semester = course.semester || 'Unassigned';
        if (!acc[semester]) {
            acc[semester] = [];
        }
        acc[semester].push(course);
        return acc;
    }, {});

    return (
        <Box>
            <Typography variant="h5" gutterBottom>
                All Available Courses
            </Typography>

            {Object.entries(coursesBySemester)
                .sort(([semA], [semB]) => semA - semB)
                .map(([semester, semesterCourses]) => (
                    <Box key={semester} sx={{ mb: 4 }}>
                        <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50' }}>
                            <Typography variant="h6" gutterBottom>
                                Semester {semester}
                            </Typography>
                            <Grid container spacing={2}>
                                {semesterCourses.map((course) => (
                                    <Grid item xs={12} sm={6} md={4} key={course.code}>
                                        <Card>
                                            <CardContent>
                                                <Typography variant="h6" component="div" gutterBottom>
                                                    {course.code}
                                                </Typography>
                                                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                                                    {course.name}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" paragraph>
                                                    {course.description}
                                                </Typography>
                                                <Divider sx={{ my: 1 }} />
                                                <Box sx={{ mt: 1 }}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Credits: {course.credits}
                                                    </Typography>
                                                    {course.prerequisites?.length > 0 && (
                                                        <Box sx={{ mt: 1 }}>
                                                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                                                Prerequisites:
                                                            </Typography>
                                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                                {course.prerequisites.map((prereq) => (
                                                                    <Chip
                                                                        key={prereq}
                                                                        label={prereq}
                                                                        size="small"
                                                                        variant="outlined"
                                                                    />
                                                                ))}
                                                            </Box>
                                                        </Box>
                                                    )}
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </Paper>
                    </Box>
                ))}
        </Box>
    );
};

export default AllCourses;
