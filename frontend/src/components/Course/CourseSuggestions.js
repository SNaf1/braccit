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
    Tooltip,
    Divider
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

    const renderCourseCard = (course, index) => (
        <Grid item xs={12} md={6} key={`${course._id}-${index}`}>
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
                            size="small" 
                            color="primary" 
                            variant="outlined"
                        />
                        <Chip 
                            label={course.type} 
                            size="small" 
                            color="secondary" 
                            variant="outlined"
                        />
                        {course.isRequired && (
                            <Chip 
                                label="Required" 
                                size="small" 
                                color="error" 
                                variant="outlined"
                            />
                        )}
                    </Box>
                    {(course.prerequisites?.length > 0 || course.softPrerequisites?.length > 0) && (
                        <Box sx={{ mt: 1 }}>
                            {course.prerequisites?.length > 0 && (
                                <Typography variant="body2" color="text.secondary">
                                    Prerequisites: {course.prerequisites.join(', ')}
                                </Typography>
                            )}
                            {course.softPrerequisites?.length > 0 && (
                                <Typography variant="body2" color="text.secondary">
                                    Recommended Prerequisites: {course.softPrerequisites.join(', ')}
                                </Typography>
                            )}
                        </Box>
                    )}
                </CardContent>
            </Card>
        </Grid>
    );

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
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            These courses are recommended based on your current semester and completed courses.
                        </Typography>
                        {currentStatus?.courseLoadOptions && (
                            <Typography variant="body2" color="text.secondary">
                                Based on your CGPA ({currentStatus.cgpa.toFixed(2)}), you can take{' '}
                                {currentStatus.courseLoadOptions.suggestBoth 
                                    ? `${currentStatus.courseLoadOptions.min} to ${currentStatus.courseLoadOptions.max} courses`
                                    : `${currentStatus.courseLoadOptions.max} courses`
                                } this semester.
                            </Typography>
                        )}
                    </Box>
                    {suggestions.map((option, optionIndex) => (
                        <Box key={`option-${optionIndex}`} sx={{ mb: 4 }}>
                            <Typography variant="h6" color="primary" gutterBottom>
                                Option {optionIndex + 1}: {option.courseLoad} Courses
                            </Typography>
                            <Grid container spacing={2}>
                                {option.courses.map((course, courseIndex) => 
                                    renderCourseCard(course, `${optionIndex}-${courseIndex}`)
                                )}
                            </Grid>
                            {optionIndex < suggestions.length - 1 && (
                                <Divider sx={{ my: 3 }} />
                            )}
                        </Box>
                    ))}
                </>
            )}
        </Box>
    );
}

export default CourseSuggestions;
