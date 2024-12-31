import React, { useState, useEffect } from 'react';
import axios from '../../utils/axios';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Tabs,
    Tab,
    CircularProgress,
    Alert,
    Chip,
    Stack,
    Button,
    Paper,
    Divider,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    Search as SearchIcon,
    FilterList as FilterListIcon,
    Event as EventIcon,
    School as SchoolIcon,
    Person as PersonIcon
} from '@mui/icons-material';
import DegreeProgress from './DegreeProgress';

const AllCourses = () => {
    const [courses, setCourses] = useState([]);
    const [suggestions, setSuggestions] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [department, setDepartment] = useState('all');
    const [minSeats, setMinSeats] = useState(0);
    const [activeTab, setActiveTab] = useState(0);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [departments] = useState(['CSE', 'MAT', 'PHY', 'ENG']);

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        if (courses.length > 0) {
            filterCourses();
        }
    }, [searchTerm, department, minSeats, courses]);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/courses/suggestions');
            if (response.data && response.data.suggestedCourses) {
                setSuggestions(response.data);
                setCourses(response.data.suggestedCourses);
                setFilteredCourses(response.data.suggestedCourses);
            } else {
                throw new Error('Invalid response format');
            }
        } catch (err) {
            console.error('Error fetching courses:', err);
            setError(err.response?.data?.message || 'Failed to load courses. Please try again later.');
            setCourses([]);
            setFilteredCourses([]);
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const filterCourses = () => {
        let filtered = [...courses];

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(course => 
                (course.code && course.code.toLowerCase().includes(term)) ||
                (course.name && course.name.toLowerCase().includes(term)) ||
                (course.description && course.description.toLowerCase().includes(term))
            );
        }

        if (department !== 'all') {
            filtered = filtered.filter(course => 
                course.code && course.code.startsWith(department)
            );
        }

        if (minSeats > 0) {
            filtered = filtered.filter(course => 
                course.availableSeats && course.availableSeats >= minSeats
            );
        }

        setFilteredCourses(filtered);
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

    return (
        <Box sx={{ width: '100%' }}>
            <Tabs value={activeTab} onChange={handleTabChange} centered sx={{ mb: 3 }}>
                <Tab label="Course Selection" />
                <Tab label="Degree Progress" />
            </Tabs>

            <Box hidden={activeTab !== 0}>
                {/* Course Status Summary */}
                {suggestions && suggestions.currentStatus && (
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={3}>
                                    <Typography variant="subtitle1">
                                        Current CGPA: {suggestions.currentStatus.cgpa.toFixed(2)}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <Typography variant="subtitle1">
                                        Maximum Courses: {suggestions.currentStatus.maxCourses}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <Typography variant="subtitle1">
                                        Current Courses: {suggestions.currentStatus.currentCourseCount}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <Typography variant="subtitle1" color={
                                        suggestions.currentStatus.canTakeMore ? "success.main" : "error.main"
                                    }>
                                        {suggestions.currentStatus.canTakeMore 
                                            ? "Can take more courses" 
                                            : "Maximum courses reached"}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                )}

                {/* Filters */}
                <Paper sx={{ p: 2, mb: 3 }}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                        <TextField
                            label="Search Courses"
                            variant="outlined"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            size="small"
                            sx={{ minWidth: 200 }}
                            InputProps={{
                                startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
                            }}
                        />
                        <FormControl size="small" sx={{ minWidth: 200 }}>
                            <InputLabel>Department</InputLabel>
                            <Select
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                                label="Department"
                            >
                                <MenuItem value="all">All Departments</MenuItem>
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
                            onChange={(e) => setMinSeats(Number(e.target.value))}
                            size="small"
                            sx={{ width: 150 }}
                        />
                    </Stack>
                </Paper>

                {/* Course List */}
                <Grid container spacing={2}>
                    {filteredCourses.map((course) => (
                        <Grid item xs={12} md={6} lg={4} key={course.code || course._id}>
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
                                    
                                    {course.description && (
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            {course.description}
                                        </Typography>
                                    )}

                                    <Stack spacing={1}>
                                        {course.department && (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <SchoolIcon fontSize="small" color="action" />
                                                <Typography variant="body2">
                                                    {course.department}
                                                </Typography>
                                            </Box>
                                        )}

                                        {course.instructor && (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <PersonIcon fontSize="small" color="action" />
                                                <Typography variant="body2">
                                                    Instructor: {course.instructor}
                                                </Typography>
                                            </Box>
                                        )}

                                        {course.schedule && course.schedule.length > 0 && (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <EventIcon fontSize="small" color="action" />
                                                <Typography variant="body2">
                                                    Schedule: {course.schedule.map(s => 
                                                        `${s.day} ${s.time}`
                                                    ).join(', ')}
                                                </Typography>
                                            </Box>
                                        )}
                                    </Stack>

                                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                                        <Chip 
                                            label={`${course.availableSeats || 0} seats available`}
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

                {filteredCourses.length === 0 && !loading && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                        No courses found matching your criteria.
                    </Alert>
                )}
            </Box>

            <Box hidden={activeTab !== 1}>
                <DegreeProgress />
            </Box>
        </Box>
    );
};

export default AllCourses;
