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
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    IconButton,
    Tooltip,
    Stack,
    Button
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import EventIcon from '@mui/icons-material/Event';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import axios from '../../utils/axios';

const AllCourses = () => {
    const [courses, setCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [minSeats, setMinSeats] = useState('');
    const [departments, setDepartments] = useState([]);

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        // Extract unique departments from courses
        const depts = [...new Set(courses.map(course => course.department))].sort();
        setDepartments(depts);
    }, [courses]);

    useEffect(() => {
        filterCourses();
    }, [searchQuery, selectedDepartment, minSeats, courses]);

    const fetchCourses = async () => {
        try {
            console.log('Fetching all courses...');
            const response = await axios.get('/api/courses');
            console.log('Courses response:', response.data);
            setCourses(response.data);
            setFilteredCourses(response.data);
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

    const filterCourses = () => {
        let filtered = [...courses];

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(course => 
                course.code.toLowerCase().includes(query) ||
                course.name.toLowerCase().includes(query) ||
                course.description.toLowerCase().includes(query)
            );
        }

        // Department filter
        if (selectedDepartment) {
            filtered = filtered.filter(course => course.department === selectedDepartment);
        }

        // Available seats filter
        if (minSeats !== '') {
            filtered = filtered.filter(course => course.availableSeats >= parseInt(minSeats));
        }

        setFilteredCourses(filtered);
    };

    const resetFilters = () => {
        setSearchQuery('');
        setSelectedDepartment('');
        setMinSeats('');
    };

    const formatSchedule = (schedules) => {
        return schedules.map(s => `${s.day} (${s.time})`).join(', ');
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
            <Alert severity="error" sx={{ mt: 2 }}>
                {error}
            </Alert>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            {/* Filters */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                    <TextField
                        label="Search Courses"
                        variant="outlined"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        size="small"
                        sx={{ minWidth: 200 }}
                        InputProps={{
                            startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
                        }}
                    />
                    <FormControl size="small" sx={{ minWidth: 200 }}>
                        <InputLabel>Department</InputLabel>
                        <Select
                            value={selectedDepartment}
                            onChange={(e) => setSelectedDepartment(e.target.value)}
                            label="Department"
                        >
                            <MenuItem value="">All Departments</MenuItem>
                            {departments.map((dept) => (
                                <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        label="Min Available Seats"
                        type="number"
                        variant="outlined"
                        value={minSeats}
                        onChange={(e) => setMinSeats(e.target.value)}
                        size="small"
                        sx={{ width: 150 }}
                    />
                    <Button 
                        variant="outlined" 
                        onClick={resetFilters}
                        startIcon={<FilterListIcon />}
                    >
                        Reset Filters
                    </Button>
                </Stack>
            </Paper>

            {/* Results count */}
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Showing {filteredCourses.length} courses
            </Typography>

            {/* Course list */}
            <Grid container spacing={3}>
                {filteredCourses.map((course) => (
                    <Grid item xs={12} md={6} key={course._id}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="h6" component="div">
                                        {course.code}: {course.name}
                                    </Typography>
                                    <Chip 
                                        label={`${course.credits} Credits`}
                                        color="primary"
                                        size="small"
                                    />
                                </Box>
                                
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    {course.description}
                                </Typography>

                                <Stack spacing={1}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <SchoolIcon fontSize="small" color="action" />
                                        <Typography variant="body2">
                                            {course.department}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <PersonIcon fontSize="small" color="action" />
                                        <Typography variant="body2">
                                            Instructor: {course.instructor || 'TBA'}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <EventIcon fontSize="small" color="action" />
                                        <Typography variant="body2">
                                            Schedule: {formatSchedule(course.schedules)}
                                        </Typography>
                                    </Box>

                                    {course.labSchedules && course.labSchedules.length > 0 && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <EventIcon fontSize="small" color="action" />
                                            <Typography variant="body2">
                                                Lab: {formatSchedule(course.labSchedules)}
                                            </Typography>
                                        </Box>
                                    )}
                                </Stack>

                                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                                    <Chip 
                                        label={`${course.availableSeats} seats available`}
                                        color={course.availableSeats > 0 ? "success" : "error"}
                                        size="small"
                                    />
                                    {course.prerequisites && course.prerequisites.length > 0 && (
                                        <Tooltip title={`Prerequisites: ${course.prerequisites.join(', ')}`}>
                                            <Chip 
                                                label="Has Prerequisites"
                                                color="warning"
                                                size="small"
                                            />
                                        </Tooltip>
                                    )}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {filteredCourses.length === 0 && (
                <Alert severity="info" sx={{ mt: 2 }}>
                    No courses found matching your criteria.
                </Alert>
            )}
        </Box>
    );
};

export default AllCourses;
