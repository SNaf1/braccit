import React, { useState, useRef } from 'react';
import {
    Container,
    Paper,
    Tabs,
    Tab,
    Box,
    TextField,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    CircularProgress,
    IconButton
} from '@mui/material';
import { Search as SearchIcon, Delete as DeleteIcon, Download as DownloadIcon } from '@mui/icons-material';
import axios from '../utils/axios';
import { toPng } from 'html-to-image';

const Routine = () => {
    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(false);
    const [examSchedules, setExamSchedules] = useState([]);
    const [error, setError] = useState('');
    const courseInputRef = useRef('');
    const sectionInputRef = useRef('');
    const tableRef = useRef(null);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const formatDate = (date) => {
        const d = new Date(date);
        return d.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: '2-digit'
        }).replace(/ /g, '-');
    };

    const handleRemoveExam = (courseToRemove) => {
        setExamSchedules(prev => {
            const filtered = prev.filter(exam => exam.course !== courseToRemove);
            return sortExamSchedules(filtered);
        });
    };

    const sortExamSchedules = (schedules) => {
        return schedules.sort((a, b) => {
            const dateA = new Date(a.finalDate);
            const dateB = new Date(b.finalDate);
            if (dateA.getTime() === dateB.getTime()) {
                return a.startTime.localeCompare(b.startTime);
            }
            return dateA - dateB;
        });
    };

    const handleDownload = async () => {
        if (!tableRef.current || examSchedules.length === 0) return;
        
        try {
            // Hide the action column before capturing
            const actionCells = tableRef.current.querySelectorAll('th:last-child, td:last-child');
            actionCells.forEach(cell => {
                cell.style.display = 'none';
            });

            const scale = 2; // Scale factor for the image
            const element = tableRef.current;
            const width = element.scrollWidth * scale;
            const height = element.scrollHeight * scale;

            const dataUrl = await toPng(element, {
                quality: 1.0,
                backgroundColor: '#2a2a2a',
                width,
                height,
                style: {
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                    padding: '20px',
                }
            });
            
            // Show the action column again
            actionCells.forEach(cell => {
                cell.style.display = '';
            });

            const link = document.createElement('a');
            link.download = 'Exam_Routine.png';
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error('Download failed:', error);
            setError('Failed to download image. Please try again.');
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        
        const course = courseInputRef.current?.value || '';
        const section = sectionInputRef.current?.value || '';
        
        if (!course || !section) {
            setError('Please enter both course code and section');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await axios.get('/api/exam/search', {
                params: { 
                    course: course.toUpperCase(),
                    section: section
                }
            });
            
            if (response.data.length === 0) {
                setError('No exam schedule found for the given criteria');
            } else {
                // Check if course already exists
                const courseExists = examSchedules.some(exam => exam.course === response.data[0].course);
                if (courseExists) {
                    setError(`Course '${course.toUpperCase()}' is already in the list`);
                } else {
                    // Add new exam to the list and sort
                    setExamSchedules(prev => sortExamSchedules([...prev, response.data[0]]));
                    // Clear inputs after successful search
                    if (courseInputRef.current) courseInputRef.current.value = '';
                    if (sectionInputRef.current) sectionInputRef.current.value = '';
                }
            }
        } catch (error) {
            console.error('Search error:', error);
            setError(error.response?.data?.error || 'Error searching exam schedules');
        } finally {
            setLoading(false);
        }
    };

    const ExamRoutine = () => (
        <Box sx={{ mt: 3 }}>
            <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <TextField
                    label="Course Code"
                    inputRef={courseInputRef}
                    variant="outlined"
                    size="small"
                    placeholder="e.g., CSE101"
                    sx={{ bgcolor: 'background.paper' }}
                />
                <TextField
                    label="Section"
                    inputRef={sectionInputRef}
                    variant="outlined"
                    size="small"
                    placeholder="e.g., 1"
                    sx={{ bgcolor: 'background.paper' }}
                    inputProps={{ maxLength: 2 }}
                />
                <Button
                    type="submit"
                    variant="contained"
                    startIcon={<SearchIcon />}
                    disabled={loading}
                >
                    Search
                </Button>
            </Box>

            {error && (
                <Typography color="error" sx={{ mb: 2 }}>
                    {error}
                </Typography>
            )}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : examSchedules.length > 0 ? (
                <>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<DownloadIcon />}
                            onClick={handleDownload}
                        >
                            Download Routine
                        </Button>
                    </Box>
                    <Box 
                        ref={tableRef}
                        sx={{ 
                            mt: 2,
                            bgcolor: '#2a2a2a',
                            p: 3,
                            borderRadius: 1,
                            maxHeight: 'none',
                            overflow: 'visible'
                        }}
                    >
                        <Typography variant="h5" sx={{ color: '#fff', mb: 2, textAlign: 'center' }}>
                            Exam Routine
                        </Typography>
                        <TableContainer sx={{ maxHeight: 'none', overflow: 'visible' }}>
                            <Table sx={{ minWidth: 650 }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontSize: '1.1rem', fontWeight: 'bold', p: 2, color: '#fff' }}>Course</TableCell>
                                        <TableCell sx={{ fontSize: '1.1rem', fontWeight: 'bold', p: 2, color: '#fff' }}>Section</TableCell>
                                        <TableCell sx={{ fontSize: '1.1rem', fontWeight: 'bold', p: 2, color: '#fff' }}>Date</TableCell>
                                        <TableCell sx={{ fontSize: '1.1rem', fontWeight: 'bold', p: 2, color: '#fff' }}>Time</TableCell>
                                        <TableCell sx={{ fontSize: '1.1rem', fontWeight: 'bold', p: 2, color: '#fff' }}>Room</TableCell>
                                        <TableCell sx={{ fontSize: '1.1rem', fontWeight: 'bold', p: 2, color: '#fff' }}>Department</TableCell>
                                        <TableCell align="center" sx={{ fontSize: '1.1rem', fontWeight: 'bold', p: 2, color: '#fff', '@media print': { display: 'none' } }}>Action</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {examSchedules.map((exam) => (
                                        <TableRow key={exam._id}>
                                            <TableCell sx={{ fontSize: '1rem', p: 2, color: '#fff' }}>{exam.course}</TableCell>
                                            <TableCell sx={{ fontSize: '1rem', p: 2, color: '#fff' }}>{exam.section}</TableCell>
                                            <TableCell sx={{ fontSize: '1rem', p: 2, color: '#fff' }}>{formatDate(exam.finalDate)}</TableCell>
                                            <TableCell sx={{ fontSize: '1rem', p: 2, color: '#fff' }}>{`${exam.startTime} - ${exam.endTime}`}</TableCell>
                                            <TableCell sx={{ fontSize: '1rem', p: 2, color: '#fff' }}>{exam.room}</TableCell>
                                            <TableCell sx={{ fontSize: '1rem', p: 2, color: '#fff' }}>{exam.dept}</TableCell>
                                            <TableCell align="center" sx={{ p: 2, '@media print': { display: 'none' } }}>
                                                <IconButton 
                                                    onClick={() => handleRemoveExam(exam.course)}
                                                    color="error"
                                                    size="small"
                                                    sx={{ color: '#ff6666' }}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                </>
            ) : null}
        </Box>
    );

    const ClassRoutine = () => (
        <Box sx={{ mt: 3 }}>
            <Typography variant="h6" sx={{ textAlign: 'center', color: 'text.secondary' }}>
                Class Routine Feature Coming Soon
            </Typography>
        </Box>
    );

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: 3 }}>
                <Typography variant="h5" sx={{ mb: 3 }}>
                    Academic Routine
                </Typography>
                <Tabs value={tabValue} onChange={handleTabChange}>
                    <Tab label="Exam Routine" />
                    <Tab label="Class Routine" />
                </Tabs>
                <Box sx={{ mt: 2 }}>
                    {tabValue === 0 ? <ExamRoutine /> : <ClassRoutine />}
                </Box>
            </Paper>
        </Container>
    );
};

export default Routine;
