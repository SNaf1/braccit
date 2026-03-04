import React, { useState, useRef } from 'react';
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TextField,
    Button,
    Typography,
    Alert,
    IconButton,
    Chip
} from '@mui/material';
import { Delete as DeleteIcon, Download as DownloadIcon } from '@mui/icons-material';
import { toPng } from 'html-to-image';
import axios from 'axios';

const TIME_SLOTS = [
    '08:00 AM-09:20 AM',
    '09:30 AM-10:50 AM',
    '11:00 AM-12:20 PM',
    '12:30 PM-01:50 PM',
    '02:00 PM-03:20 PM',
    '03:30 PM-04:50 PM',
    '05:00 PM-06:20 PM'
];

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const ClassRoutine = () => {
    const [routineData, setRoutineData] = useState(
        TIME_SLOTS.reduce((acc, slot) => {
            acc[slot] = DAYS.reduce((dayAcc, day) => {
                dayAcc[day] = [];
                return dayAcc;
            }, {});
            return acc;
        }, {})
    );
    const [courseCode, setCourseCode] = useState('');
    const [section, setSection] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [addedCourses, setAddedCourses] = useState(new Set());
    const tableRef = useRef(null);

    const parseSchedule = (schedule) => {
        const schedules = schedule.split(',');
        return schedules.map(sch => {
            // Match pattern: Day(Time-Time-Room)
            const match = sch.match(/([A-Za-z]+)\(([^-]+ [AP]M)-([^-]+ [AP]M)-([^)]+)\)/);
            if (match) {
                const [_, day, startTime, endTime, room] = match;
                const time = `${startTime}-${endTime}`;
                return { day, time, room };
            }
            return null;
        }).filter(Boolean);
    };

    const checkTimeConflict = (existingClasses, newTime) => {
        return existingClasses.some(existingClass => existingClass.time === newTime);
    };

    const handleAddCourse = async () => {
        if (!courseCode.trim() || !section.trim()) {
            setError('Please enter both course code and section');
            return;
        }

        // Check if course is already added
        if (addedCourses.has(courseCode.toUpperCase())) {
            setError('This course is already added to the routine');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await axios.get('https://usis-cdn.eniamza.com/usisdump.json');
            const courseData = response.data.find(course => {
                // Normalize course code comparison
                const courseCodeMatches = course.courseCode.toUpperCase() === courseCode.toUpperCase();
                
                // Extract section from courseDetails (format: "CSE421-[09]")
                const sectionMatch = course.courseDetails.match(/\[(\d+)\]/);
                const courseSection = sectionMatch ? sectionMatch[1] : null;
                
                // Pad single digit section with zero for comparison
                const normalizedSection = section.length === 1 ? `0${section}` : section;
                const sectionMatches = courseSection === normalizedSection;
                
                return courseCodeMatches && sectionMatches;
            });

            if (!courseData) {
                setError('Course not found');
                return;
            }

            // Get unique schedules by combining and deduplicating
            const allSchedules = [
                ...parseSchedule(courseData.classSchedule),
                ...parseSchedule(courseData.classLabSchedule)
            ];

            // Remove duplicates based on day, time, and room
            const uniqueSchedules = allSchedules.filter((schedule, index, self) =>
                index === self.findIndex(s => 
                    s.day === schedule.day && 
                    s.time === schedule.time && 
                    s.room === schedule.room
                )
            );

            const newRoutineData = { ...routineData };
            let hasConflict = false;

            uniqueSchedules.forEach(({ day, time, room }) => {
                if (checkTimeConflict(newRoutineData[time][day], time)) {
                    hasConflict = true;
                    return;
                }

                newRoutineData[time][day].push({
                    courseCode: courseData.courseCode,
                    room,
                    hasConflict: false
                });
            });

            if (hasConflict) {
                setError('Time conflict detected! The course was not added.');
                return;
            }

            setRoutineData(newRoutineData);
            setAddedCourses(prev => new Set([...prev, courseData.courseCode]));
            setCourseCode('');
            setSection('');

        } catch (error) {
            console.error('Error fetching course data:', error);
            setError('Failed to fetch course data');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveCourse = (courseCode) => {
        const newRoutineData = { ...routineData };
        
        TIME_SLOTS.forEach(slot => {
            DAYS.forEach(day => {
                newRoutineData[slot][day] = newRoutineData[slot][day].filter(
                    course => course.courseCode !== courseCode
                );
            });
        });

        setRoutineData(newRoutineData);
        setAddedCourses(prev => new Set([...prev].filter(course => course !== courseCode)));
    };

    const handleDownload = async () => {
        if (!tableRef.current) return;
        
        try {
            const scale = 2;
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
            
            const link = document.createElement('a');
            link.download = 'Class_Routine.png';
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error('Download failed:', error);
            setError('Failed to download image');
        }
    };

    return (
        <Box sx={{ p: 2 }}>
            <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                    label="Course Code"
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    size="small"
                    sx={{ bgcolor: 'background.paper' }}
                />
                <TextField
                    label="Section"
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    size="small"
                    sx={{ bgcolor: 'background.paper' }}
                />
                <Button
                    variant="contained"
                    onClick={handleAddCourse}
                    disabled={loading}
                >
                    Add Course
                </Button>
                <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownload}
                    disabled={addedCourses.size === 0}
                >
                    Download Routine
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {addedCourses.size > 0 && (
                <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {Array.from(addedCourses).map((course) => (
                        <Chip
                            key={course}
                            label={course}
                            onDelete={() => handleRemoveCourse(course)}
                            color="primary"
                            variant="outlined"
                            sx={{ borderRadius: 1 }}
                        />
                    ))}
                </Box>
            )}

            <Box ref={tableRef} sx={{ bgcolor: '#2a2a2a', p: 2, borderRadius: 1 }}>
                <Typography variant="h5" sx={{ color: '#fff', mb: 2, textAlign: 'center' }}>
                    Class Routine
                </Typography>
                <TableContainer sx={{ maxHeight: 'none', overflow: 'visible' }}>
                    <Table 
                        sx={{ 
                            minWidth: 600,
                            borderCollapse: 'separate',
                            borderSpacing: 0,
                            '& th, & td': {
                                borderRight: '1px solid rgba(255, 255, 255, 0.12)',
                                padding: '6px',
                                '&:last-child': {
                                    borderRight: 'none'
                                }
                            }
                        }}
                    >
                        <TableHead>
                            <TableRow>
                                <TableCell 
                                    sx={{ 
                                        color: '#fff', 
                                        fontWeight: 'bold',
                                        borderBottom: '2px solid rgba(255, 255, 255, 0.12)',
                                        width: '130px',
                                        textAlign: 'center',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    Time/Day
                                </TableCell>
                                {DAYS.map(day => (
                                    <TableCell 
                                        key={day} 
                                        sx={{ 
                                            color: '#fff', 
                                            fontWeight: 'bold',
                                            borderBottom: '2px solid rgba(255, 255, 255, 0.12)',
                                            width: 'calc((100% - 130px) / 7)',
                                            textAlign: 'center',
                                            fontSize: '0.9rem'
                                        }}
                                    >
                                        {day}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {TIME_SLOTS.map(slot => (
                                <TableRow key={slot}>
                                    <TableCell 
                                        sx={{ 
                                            color: '#fff',
                                            backgroundColor: 'rgba(255, 255, 255, 0.04)',
                                            width: '130px',
                                            textAlign: 'center',
                                            fontSize: '0.85rem'
                                        }}
                                    >
                                        {slot}
                                    </TableCell>
                                    {DAYS.map(day => (
                                        <TableCell 
                                            key={day} 
                                            sx={{ 
                                                color: '#fff',
                                                padding: '6px',
                                                width: 'calc((100% - 130px) / 7)',
                                                textAlign: 'center',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(255, 255, 255, 0.04)'
                                                }
                                            }}
                                        >
                                            {routineData[slot][day].map((course, index) => (
                                                <Box 
                                                    key={index}
                                                    sx={{ 
                                                        color: course.hasConflict ? '#ff6666' : '#fff',
                                                        display: 'flex',
                                                        justifyContent: 'center'
                                                    }}
                                                >
                                                    <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                                                        {`${course.courseCode} (${course.room})`}
                                                    </Typography>
                                                </Box>
                                            ))}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Box>
    );
};

export default ClassRoutine;
