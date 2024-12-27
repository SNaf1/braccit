import React from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    Tabs,
    Tab
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import CourseSuggestions from '../components/Course/CourseSuggestions';
import AllCourses from '../components/Course/AllCourses';

const Courses = () => {
    const { user } = useAuth();
    const [tabValue, setTabValue] = React.useState(0);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    if (!user) {
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h5" gutterBottom>
                        Please log in to view course information
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        You need to be logged in to see your course suggestions and manage your courses.
                    </Typography>
                </Paper>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>
                Course Management
            </Typography>
            
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs 
                    value={tabValue} 
                    onChange={handleTabChange}
                    aria-label="course management tabs"
                >
                    <Tab label="Course Suggestions" />
                    <Tab label="My Courses" />
                    <Tab label="All Courses" />
                </Tabs>
            </Box>

            {tabValue === 0 && (
                <Box>
                    <Typography variant="h5" gutterBottom>
                        Recommended Courses
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph>
                        Based on your completed courses and prerequisites, here are some courses you might want to take:
                    </Typography>
                    <CourseSuggestions />
                </Box>
            )}

            {tabValue === 1 && (
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Current Courses
                    </Typography>
                    {user.currentCourses && user.currentCourses.length > 0 ? (
                        <Typography>
                            Display current courses here...
                        </Typography>
                    ) : (
                        <Typography color="text.secondary">
                            You are not enrolled in any courses this semester.
                        </Typography>
                    )}

                    <Typography variant="h6" sx={{ mt: 4 }} gutterBottom>
                        Completed Courses
                    </Typography>
                    {user.completedCourses && user.completedCourses.length > 0 ? (
                        <Typography>
                            Display completed courses here...
                        </Typography>
                    ) : (
                        <Typography color="text.secondary">
                            You haven't completed any courses yet.
                        </Typography>
                    )}
                </Paper>
            )}

            {tabValue === 2 && (
                <Box>
                    <AllCourses />
                </Box>
            )}
        </Container>
    );
};

export default Courses;
