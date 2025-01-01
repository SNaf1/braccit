import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Box,
    Button,
    TextField,
    Typography,
    Paper,
    Grid,
    Card,
    CardContent,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
} from '@mui/material';

const MyCourses = () => {
    const [courses, setCourses] = useState([]);
    const [statistics, setStatistics] = useState({
        totalCredits: 0,
        completedSemesters: 0,
        latestCGPA: 0
    });
    const [openDialog, setOpenDialog] = useState(false);
    const [formData, setFormData] = useState({
        semester: '',
        courseCodes: '',
        cgpa: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchCourses = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/student-courses', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setCourses(response.data.data.courses);
            setStatistics(response.data.data.statistics);
        } catch (error) {
            setError('Failed to fetch courses');
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const courseCodesArray = formData.courseCodes.split(',').map(code => code.trim());
            
            await axios.post(
                'http://localhost:5000/api/student-courses',
                {
                    semester: formData.semester,
                    courseCodes: courseCodesArray,
                    cgpa: parseFloat(formData.cgpa)
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            setSuccess('Courses added successfully');
            setOpenDialog(false);
            setFormData({ semester: '', courseCodes: '', cgpa: '' });
            fetchCourses();
        } catch (error) {
            setError('Failed to add courses');
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/student-courses/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            fetchCourses();
            setSuccess('Semester courses deleted successfully');
        } catch (error) {
            setError('Failed to delete courses');
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
            
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom>My Courses</Typography>
                <Button variant="contained" color="primary" onClick={() => setOpenDialog(true)}>
                    Add Semester Courses
                </Button>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>Statistics</Typography>
                        <Typography>Total Credits: {statistics.totalCredits}</Typography>
                        <Typography>Completed Semesters: {statistics.completedSemesters}</Typography>
                        <Typography>Current CGPA: {statistics.latestCGPA.toFixed(2)}</Typography>
                    </Paper>
                </Grid>

                <Grid item xs={12}>
                    <Grid container spacing={2}>
                        {courses.map((course) => (
                            <Grid item xs={12} md={6} key={course._id}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6">Semester: {course.semester}</Typography>
                                        <Typography>CGPA: {course.cgpa.toFixed(2)}</Typography>
                                        <Typography>Credits: {course.courseCodes.length * 3}</Typography>
                                        <Typography>Courses:</Typography>
                                        <Box sx={{ pl: 2 }}>
                                            {course.courseCodes.map((code, index) => (
                                                <Typography key={index}>• {code}</Typography>
                                            ))}
                                        </Box>
                                        <Button
                                            color="error"
                                            onClick={() => handleDelete(course._id)}
                                            sx={{ mt: 1 }}
                                        >
                                            Delete
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Grid>
            </Grid>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>Add Semester Courses</DialogTitle>
                <DialogContent>
                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                        <TextField
                            fullWidth
                            label="Semester (e.g., Fall 2023)"
                            value={formData.semester}
                            onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                            sx={{ mb: 2 }}
                            required
                        />
                        <TextField
                            fullWidth
                            label="Course Codes (comma-separated)"
                            value={formData.courseCodes}
                            onChange={(e) => setFormData({ ...formData, courseCodes: e.target.value })}
                            helperText="Enter course codes separated by commas (e.g., CSE101, CSE102)"
                            sx={{ mb: 2 }}
                            required
                        />
                        <TextField
                            fullWidth
                            label="CGPA"
                            type="number"
                            inputProps={{ step: "0.01", min: "0", max: "4" }}
                            value={formData.cgpa}
                            onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                            required
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained">Add</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default MyCourses;
