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
            setProgress(response.data);
            setLoading(false);
        } catch (err) {
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

    if (error) {
        return (
            <Alert severity="error" sx={{ m: 2 }}>
                {error}
            </Alert>
        );
    }

    const calculatePercentage = (completed, total) => {
        return Math.round((completed / total) * 100);
    };

    return (
        <Box sx={{ p: 3 }}>
            {/* Overall Progress Card */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={4}>
                            <Box display="flex" alignItems="center" justifyContent="center">
                                <Box position="relative" display="inline-flex">
                                    <CircularProgress
                                        variant="determinate"
                                        value={calculatePercentage(
                                            progress.totalCredits.completed,
                                            progress.totalCredits.required
                                        )}
                                        size={120}
                                        thickness={4}
                                        sx={{ color: 'primary.main' }}
                                    />
                                    <Box
                                        position="absolute"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        top={0}
                                        left={0}
                                        right={0}
                                        bottom={0}
                                    >
                                        <Typography variant="h6" component="div" color="text.secondary">
                                            {calculatePercentage(
                                                progress.totalCredits.completed,
                                                progress.totalCredits.required
                                            )}%
                                        </Typography>
                                    </Box>
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
            <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">
                        University Core Requirements ({progress.universityCore.totalCredits.completed}/
                        {progress.universityCore.totalCredits.required} credits)
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Grid container spacing={2}>
                        {Object.entries(progress.universityCore.streams).map(([streamName, stream]) => (
                            <Grid item xs={12} key={streamName}>
                                <Card variant="outlined" sx={{ mb: 2 }}>
                                    <CardContent>
                                        <Typography variant="subtitle1" gutterBottom>
                                            {streamName.replace(/([A-Z])/g, ' $1').trim()}
                                        </Typography>
                                        <Box sx={{ mb: 2 }}>
                                            {stream.completed.map(code => (
                                                <Chip
                                                    key={code}
                                                    label={code}
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
                                        {stream.optionalCompleted && (
                                            <Box>
                                                <Typography variant="body2" color="text.secondary">
                                                    Optional Courses Completed: {stream.optionalCompleted.length}
                                                </Typography>
                                            </Box>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </AccordionDetails>
            </Accordion>

            {/* School Core Progress */}
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
                            <LinearProgress
                                variant="determinate"
                                value={calculatePercentage(
                                    progress.schoolCore.totalCredits.completed,
                                    progress.schoolCore.totalCredits.required
                                )}
                                sx={{ mb: 2, height: 10, borderRadius: 5 }}
                            />
                            <Box sx={{ mb: 2 }}>
                                {progress.schoolCore.completed.map(code => (
                                    <Chip
                                        key={code}
                                        label={code}
                                        color="success"
                                        size="small"
                                        sx={{ m: 0.5 }}
                                    />
                                ))}
                                {progress.schoolCore.remaining.map(code => (
                                    <Chip
                                        key={code}
                                        label={code}
                                        variant="outlined"
                                        size="small"
                                        sx={{ m: 0.5 }}
                                    />
                                ))}
                            </Box>
                        </Grid>
                    </Grid>
                </AccordionDetails>
            </Accordion>

            {/* Program Core Progress */}
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
                            <LinearProgress
                                variant="determinate"
                                value={calculatePercentage(
                                    progress.programCore.totalCredits.completed,
                                    progress.programCore.totalCredits.required
                                )}
                                sx={{ mb: 2, height: 10, borderRadius: 5 }}
                            />
                            <Box sx={{ mb: 2 }}>
                                {progress.programCore.completed.map(code => (
                                    <Chip
                                        key={code}
                                        label={code}
                                        color="success"
                                        size="small"
                                        sx={{ m: 0.5 }}
                                    />
                                ))}
                                {progress.programCore.remaining.map(code => (
                                    <Chip
                                        key={code}
                                        label={code}
                                        variant="outlined"
                                        size="small"
                                        sx={{ m: 0.5 }}
                                    />
                                ))}
                            </Box>
                        </Grid>
                    </Grid>
                </AccordionDetails>
            </Accordion>

            {/* Program Elective Progress */}
            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">
                        Program Electives ({progress.programElective.totalCredits.completed}/
                        {progress.programElective.totalCredits.required} credits)
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                    CSE Electives
                                </Typography>
                                {progress.programElective.completedCSE.map(code => (
                                    <Chip
                                        key={code}
                                        label={code}
                                        color="success"
                                        size="small"
                                        sx={{ m: 0.5 }}
                                    />
                                ))}
                            </Box>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Other Electives
                                </Typography>
                                {progress.programElective.completedOther.map(code => (
                                    <Chip
                                        key={code}
                                        label={code}
                                        color="success"
                                        size="small"
                                        sx={{ m: 0.5 }}
                                    />
                                ))}
                            </Box>
                        </Grid>
                    </Grid>
                </AccordionDetails>
            </Accordion>

            {/* Thesis/Project Progress */}
            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">
                        Thesis/Project ({progress.projectInternshipThesis.totalCredits.completed}/
                        {progress.projectInternshipThesis.totalCredits.required} credits)
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Box sx={{ mb: 2 }}>
                                {progress.projectInternshipThesis.completed.map(code => (
                                    <Chip
                                        key={code}
                                        label={code}
                                        color="success"
                                        size="small"
                                        sx={{ m: 0.5 }}
                                    />
                                ))}
                                {progress.projectInternshipThesis.remaining.map(code => (
                                    <Chip
                                        key={code}
                                        label={code}
                                        variant="outlined"
                                        size="small"
                                        sx={{ m: 0.5 }}
                                    />
                                ))}
                            </Box>
                        </Grid>
                    </Grid>
                </AccordionDetails>
            </Accordion>
        </Box>
    );
};

export default DegreeProgress;
