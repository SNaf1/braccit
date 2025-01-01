import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    CircularProgress,
    Alert,
    Grid,
    Card,
    CardContent,
    Chip,
    Tooltip
} from '@mui/material';
import axios from '../../utils/axios';

function CourseSuggestions() {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentStatus, setCurrentStatus] = useState(null);

    useEffect(() => {
        fetchSuggestions();
    }, []);

    const fetchSuggestions = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get('/api/courses/suggestions');
            console.log('Course suggestions response:', response.data);
            
            if (response.data.suggestedCourses) {
                setSuggestions(response.data.suggestedCourses);
                setCurrentStatus(response.data.currentStatus);
            } else {
                setSuggestions([]);
            }
        } catch (error) {
            console.error('Error fetching course suggestions:', error);
            setError('Failed to fetch course suggestions. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const getSemesterDisplay = (semester) => {
        if (!semester) return '1';
        const suffixes = {
            1: 'st',
            2: 'nd',
            3: 'rd'
        };
        const suffix = suffixes[semester] || 'th';
        return `${semester}${suffix}`;
    };

    return (
        <Box sx={{ mt: 2 }}>
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error">{error}</Alert>
            ) : suggestions.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h6" gutterBottom>
                        No course suggestions available
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        You might have completed all courses for this semester.
                    </Typography>
                    {currentStatus && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Current Semester: {getSemesterDisplay(currentStatus.currentSemester)}
                        </Typography>
                    )}
                </Box>
            ) : (
                <>
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Suggested Courses - {getSemesterDisplay(currentStatus?.currentSemester)} Semester
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            These courses are recommended based on your current semester and completed courses.
                        </Typography>
                    </Box>
                    <Grid container spacing={2}>
                        {suggestions.map((course) => (
                            <Grid item xs={12} md={6} key={course.code}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" component="div">
                                            {course.code}
                                        </Typography>
                                        <Typography variant="subtitle1" gutterBottom>
                                            {course.name}
                                        </Typography>
                                       
                                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                                            <Chip 
                                                label={`${course.credits} Credits`}
                                                color="primary"
                                                size="small"
                                            />
                                            <Chip 
                                                label={course.type}
                                                color="secondary"
                                                size="small"
                                            />
                                            {course.isRequired && (
                                                <Chip 
                                                    label="Required"
                                                    color="error"
                                                    size="small"
                                                />
                                            )}
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                                            {course.instructor && (
                                                <Typography variant="caption" color="text.secondary" display="block">
                                                    Instructor: {course.instructor}
                                                </Typography>
                                            )}
                                            {course.sectionDetails && (
                                                <Typography variant="caption" color="text.secondary" display="block">
                                                    Section: {course.sectionDetails}
                                                </Typography>
                                            )}
                                        </Box>
                                        {course.prerequisites && course.prerequisites.length > 0 && (
                                            <Typography variant="caption" color="text.secondary" display="block">
                                                Prerequisites: {course.prerequisites.join(', ')}
                                            </Typography>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </>
            )}
        </Box>
    );
}

export default CourseSuggestions;
