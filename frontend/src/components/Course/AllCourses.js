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
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get('/api/courses');
            if (response.data.length > 0) {
                console.log('Frontend received course data sample:', {
                    instructor: response.data[0].instructor,
                    schedules: response.data[0].schedules,
                    labSchedules: response.data[0].labSchedules,
                    fullCourse: response.data[0]
                });
            }
            setCourses(response.data);
            setFilteredCourses(response.data);
        } catch (error) {
            console.error('Error fetching courses:', error);
            setError('Failed to fetch courses. Please try again later.');
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
            filtered = filtered.filter(course => {
                const courseCode = (course.courseCode || course.code || '').toLowerCase();
                const courseName = (course.courseTitle || course.name || '').toLowerCase();
                const courseDetails = (course.courseDetails || course.description || '').toLowerCase();
                const faculty = (course.faculty || '').toLowerCase();

                return courseCode.includes(term) ||
                       courseName.includes(term) ||
                       courseDetails.includes(term) ||
                       faculty.includes(term);
            });
        }

        if (department !== 'all') {
            filtered = filtered.filter(course => {
                const courseCode = course.courseCode || course.code || '';
                return courseCode.startsWith(department);
            });
        }

        if (minSeats > 0) {
            filtered = filtered.filter(course => {
                const seats = parseInt(course.availableSeat || course.availableSeats || 0);
                return seats >= minSeats;
            });
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
                    {filteredCourses.map((course, index) => {
                        // Create a unique key using course code, section, and faculty
                        const uniqueKey = `${course.courseCode || course.code}_${course.section || ''}_${course.faculty || ''}_${index}`;
                        
                        return (
                            <Grid item xs={12} md={6} lg={4} key={uniqueKey}>
                                <Card>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="h6" component="div">
                                                {course.courseCode || course.code}: {course.courseTitle || course.name}
                                                {course.section && 
                                                    <Typography component="span" color="text.secondary" sx={{ ml: 1 }}>
                                                        (Section {course.section})
                                                    </Typography>
                                                }
                                            </Typography>
                                            <Chip 
                                                label={`${course.courseCredit || course.credits} Credits`}
                                                color="primary"
                                                size="small"
                                            />
                                        </Box>
                                        
                                        {(course.courseDetails || course.description) && (
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                {course.courseDetails || course.description}
                                            </Typography>
                                        )}

                                        <Stack spacing={1}>
                                            {(course.department || (course.courseCode && course.courseCode.split(' ')[0])) && (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <SchoolIcon fontSize="small" color="action" />
                                                    <Typography variant="body2">
                                                        {course.department || course.courseCode.split(' ')[0]}
                                                    </Typography>
                                                </Box>
                                            )}

                                            {course.instructor && (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <PersonIcon fontSize="small" color="action" />
                                                    <Typography variant="body2">
                                                        {course.instructor}
                                                        {course.instructorInitials && ` (${course.instructorInitials})`}
                                                    </Typography>
                                                </Box>
                                            )}

                                            {course.schedules && course.schedules.length > 0 && (
                                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                                    <EventIcon fontSize="small" color="action" sx={{ mt: 0.5 }} />
                                                    <Typography variant="body2" component="div" sx={{ 
                                                        fontFamily: 'inherit',
                                                        whiteSpace: 'pre-wrap',
                                                        wordBreak: 'break-word'
                                                    }}>
                                                        {[...new Set(course.schedules)].map((schedule, index) => (
                                                            <div key={index}>{schedule}</div>
                                                        ))}
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Stack>

                                        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                            <Chip 
                                                label={`${course.availableSeat || course.availableSeats || 0} seats available`}
                                                color={(course.availableSeat || course.availableSeats) > 0 ? "success" : "error"}
                                                size="small"
                                            />
                                            {(course.preRequisiteCourses || course.prerequisites) && 
                                             (course.preRequisiteCourses?.trim() || course.prerequisites?.length > 0) && (
                                                <Tooltip title={`Prerequisites: ${
                                                    Array.isArray(course.prerequisites) 
                                                        ? course.prerequisites.join(', ')
                                                        : course.preRequisiteCourses || 'None'
                                                }`}>
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
                        );
                    })}
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
