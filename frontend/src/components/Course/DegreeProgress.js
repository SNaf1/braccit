import React, { useState, useEffect } from 'react';
import axios from '../../utils/axios';
import {
    Box,
    Card,
    CardContent,
    CircularProgress,
    Grid,
    LinearProgress,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Chip,
    Divider,
    Alert
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    CheckCircle as CheckCircleIcon,
    Warning as WarningIcon,
    School as SchoolIcon
} from '@mui/icons-material';

const DegreeProgress = () => {
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProgress();
    }, []);

    const fetchProgress = async () => {
        try {
            const response = await axios.get('/api/courses/progress');
            console.log('Progress data:', response.data);
            setProgress(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching progress:', err);
            setError('Failed to load degree progress');
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
            </Box>
        );
    }

    if (error || !progress) {
        return (
            <Box p={3}>
                <Alert severity="error">{error || 'Failed to load degree progress'}</Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ mt: 2 }}>
            {/* Overall Progress Card */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                                <CircularProgress
                                    variant="determinate"
                                    value={(progress.totalCredits.completed / progress.totalCredits.required) * 100}
                                    size={100}
                                />
                                <Box
                                    sx={{
                                        top: 0,
                                        left: 0,
                                        bottom: 0,
                                        right: 0,
                                        position: 'absolute',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Typography variant="caption" component="div" color="text.secondary">
                                        {Math.round((progress.totalCredits.completed / progress.totalCredits.required) * 100)}%
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <Typography variant="h5" gutterBottom>
                                Overall Degree Progress
                            </Typography>
                            <Typography variant="body1" color="text.secondary" gutterBottom>
                                {progress.totalCredits.completed} of {progress.totalCredits.required} credits completed
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {progress.totalCredits.remaining} credits remaining
                            </Typography>
                            {progress.isOnTrack ? (
                                <Chip
                                    icon={<CheckCircleIcon />}
                                    label="On Track"
                                    color="success"
                                    sx={{ mt: 1 }}
                                />
                            ) : (
                                <Chip
                                    icon={<WarningIcon />}
                                    label="Requirements Pending"
                                    color="warning"
                                    sx={{ mt: 1 }}
                                />
                            )}
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* University Core Progress */}
            {progress.universityCore && (
                <Accordion defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">
                            University Core Requirements ({progress.universityCore.totalCredits.completed}/
                            {progress.universityCore.totalCredits.required} credits)
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Grid container spacing={2}>
                            {Object.entries(progress.universityCore.streams || {}).map(([streamName, stream]) => (
                                <Grid item xs={12} key={streamName}>
                                    <Card variant="outlined" sx={{ mb: 2 }}>
                                        <CardContent>
                                            <Typography variant="subtitle1" gutterBottom>
                                                {streamName.replace(/([A-Z])/g, ' $1').trim()}
                                            </Typography>
                                            <Box sx={{ mb: 2 }}>
                                                {stream.completed.map(course => (
                                                    <Chip
                                                        key={course.code}
                                                        label={`${course.code} - ${course.type}`}
                                                        color="success"
                                                        size="small"
                                                        sx={{ m: 0.5 }}
                                                    />
                                                ))}
                                                {stream.remaining.map(code => (
                                                    <Chip
                                                        key={code}
                                                        label={code}
                                                        variant="outlined"
                                                        size="small"
                                                        sx={{ m: 0.5 }}
                                                    />
                                                ))}
                                            </Box>
                                            {stream.optionalCompleted && stream.optionalCompleted.length > 0 && (
                                                <Box>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Optional Courses Completed: {stream.optionalCompleted.length}
                                                    </Typography>
                                                </Box>
                                            )}
                                            <Box sx={{ mt: 2 }}>
                                                <LinearProgress 
                                                    variant="determinate" 
                                                    value={(stream.credits.completed / stream.credits.required) * 100} 
                                                />
                                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                                    {stream.credits.completed} of {stream.credits.required} credits completed
                                                </Typography>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </AccordionDetails>
                </Accordion>
            )}

            {/* School Core Progress */}
            {progress.schoolCore && (
                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">
                            School Core ({progress.schoolCore.totalCredits.completed}/
                            {progress.schoolCore.totalCredits.required} credits)
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Box sx={{ mb: 2 }}>
                                            {progress.schoolCore.courses.map(course => (
                                                <Chip
                                                    key={course.code}
                                                    label={`${course.code} - ${course.name}`}
                                                    color="success"
                                                    size="small"
                                                    sx={{ m: 0.5 }}
                                                />
                                            ))}
                                        </Box>
                                        <Box sx={{ mt: 2 }}>
                                            <LinearProgress 
                                                variant="determinate" 
                                                value={(progress.schoolCore.totalCredits.completed / progress.schoolCore.totalCredits.required) * 100} 
                                            />
                                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                                {progress.schoolCore.totalCredits.completed} of {progress.schoolCore.totalCredits.required} credits completed
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </AccordionDetails>
                </Accordion>
            )}

            {/* Program Core Progress */}
            {progress.programCore && (
                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">
                            Program Core ({progress.programCore.totalCredits.completed}/
                            {progress.programCore.totalCredits.required} credits)
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Box sx={{ mb: 2 }}>
                                            {progress.programCore.courses.map(course => (
                                                <Chip
                                                    key={course.code}
                                                    label={`${course.code} - ${course.name}`}
                                                    color="success"
                                                    size="small"
                                                    sx={{ m: 0.5 }}
                                                />
                                            ))}
                                        </Box>
                                        <Box sx={{ mt: 2 }}>
                                            <LinearProgress 
                                                variant="determinate" 
                                                value={(progress.programCore.totalCredits.completed / progress.programCore.totalCredits.required) * 100} 
                                            />
                                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                                {progress.programCore.totalCredits.completed} of {progress.programCore.totalCredits.required} credits completed
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </AccordionDetails>
                </Accordion>
            )}
        </Box>
    );
};

export default DegreeProgress;
