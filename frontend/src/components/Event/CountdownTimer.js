import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
    Box, 
    Typography, 
    Paper, 
    Container, 
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Divider,
    Alert,
    Snackbar
} from '@mui/material';
import { PersonAdd as PersonAddIcon, PersonRemove as PersonRemoveIcon } from '@mui/icons-material';
import axios from '../../utils/axios';

const CountdownTimer = () => {
    const { name: communityName, eventId } = useParams();
    const [timeLeft, setTimeLeft] = useState(null);
    const [event, setEvent] = useState(null);
    const [attendees, setAttendees] = useState([]);
    const [isGoing, setIsGoing] = useState(false);
    const [error, setError] = useState('');
    const [showSnackbar, setShowSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [communityId, setCommunityId] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date("2025-01-02T18:15:02+06:00"));

    // First fetch community ID from name
    useEffect(() => {
        const fetchCommunityId = async () => {
            try {
                const response = await axios.get(`/api/b/${communityName}`);
                setCommunityId(response.data._id);
            } catch (error) {
                console.error('Error fetching community:', error);
                setError('Failed to load community details');
            }
        };
        
        if (communityName) {
            fetchCommunityId();
        }
    }, [communityName]);

    useEffect(() => {
        const fetchEventDetails = async () => {
            if (!communityId || !eventId) return;

            try {
                const response = await axios.get(`/api/b/${communityId}/events/${eventId}`);
                setEvent(response.data);
                setIsGoing(response.data.isGoing);
                setAttendees(response.data.going || []);
                setError(null);
            } catch (error) {
                console.error('Error fetching event:', error);
                setError(error.response?.data?.error || 'Failed to fetch event details');
            }
        };

        fetchEventDetails();
    }, [communityId, eventId]);

    useEffect(() => {
        if (!event?.startDate) return;

        const calculateTimeLeft = () => {
            const startTime = new Date(event.startDate).getTime();
            const now = currentTime.getTime();
            const difference = startTime - now;

            if (difference <= 0) {
                setTimeLeft(null);
                return;
            }

            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            setTimeLeft({ days, hours, minutes, seconds });
        };

        calculateTimeLeft();
        const timer = setInterval(() => {
            setCurrentTime(prevTime => {
                const newTime = new Date(prevTime.getTime());
                newTime.setSeconds(newTime.getSeconds() + 1);
                return newTime;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [event?.startDate, currentTime]);

    const handleAttendance = async () => {
        if (!communityId) return;

        try {
            const response = await axios.post(`/api/b/${communityId}/events/${eventId}/going`);
            setIsGoing(response.data.isGoing);
            setAttendees(response.data.going);
            setSnackbarMessage(response.data.isGoing ? 'You are now attending' : 'You are no longer attending');
            setShowSnackbar(true);
            setError(null);
        } catch (error) {
            console.error('Error updating attendance:', error);
            setError(error.response?.data?.error || 'Failed to update attendance status');
            setShowSnackbar(true);
        }
    };

    const renderCountdown = () => {
        if (!timeLeft) {
            return <Typography variant="h6" sx={{ color: '#ff4444' }}>Event has started!</Typography>;
        }

        return (
            <Box sx={{ 
                display: 'flex', 
                gap: 3, 
                justifyContent: 'center', 
                mb: 3,
                p: 4,
                backgroundColor: '#1a237e',
                borderRadius: 2,
                boxShadow: '0 4px 20px rgba(0,0,0,0.25)'
            }}>
                <Box sx={{ 
                    textAlign: 'center',
                    minWidth: 100,
                    p: 2,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderRadius: 1
                }}>
                    <Typography variant="h2" sx={{ 
                        fontWeight: 'bold',
                        color: '#fff',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                    }}>
                        {String(timeLeft.days).padStart(2, '0')}
                    </Typography>
                    <Typography sx={{ color: '#90caf9' }}>Days</Typography>
                </Box>
                <Box sx={{ 
                    textAlign: 'center',
                    minWidth: 100,
                    p: 2,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderRadius: 1
                }}>
                    <Typography variant="h2" sx={{ 
                        fontWeight: 'bold',
                        color: '#fff',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                    }}>
                        {String(timeLeft.hours).padStart(2, '0')}
                    </Typography>
                    <Typography sx={{ color: '#90caf9' }}>Hours</Typography>
                </Box>
                <Box sx={{ 
                    textAlign: 'center',
                    minWidth: 100,
                    p: 2,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderRadius: 1
                }}>
                    <Typography variant="h2" sx={{ 
                        fontWeight: 'bold',
                        color: '#fff',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                    }}>
                        {String(timeLeft.minutes).padStart(2, '0')}
                    </Typography>
                    <Typography sx={{ color: '#90caf9' }}>Minutes</Typography>
                </Box>
                <Box sx={{ 
                    textAlign: 'center',
                    minWidth: 100,
                    p: 2,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderRadius: 1
                }}>
                    <Typography variant="h2" sx={{ 
                        fontWeight: 'bold',
                        color: '#fff',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                    }}>
                        {String(timeLeft.seconds).padStart(2, '0')}
                    </Typography>
                    <Typography sx={{ color: '#90caf9' }}>Seconds</Typography>
                </Box>
            </Box>
        );
    };

    if (error) {
        return (
            <Container>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    if (!event) {
        return (
            <Container>
                <Typography>Loading event details...</Typography>
            </Container>
        );
    }

    return (
        <Container>
            <Paper elevation={3} sx={{ 
                p: 4, 
                mt: 3, 
                backgroundColor: '#121212',
                color: '#fff',
                borderRadius: 2
            }}>
                <Typography variant="h3" gutterBottom sx={{ 
                    color: '#64b5f6',
                    fontWeight: 'bold',
                    mb: 3,
                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                }}>
                    {event.title}
                </Typography>

                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ color: '#90caf9', mb: 1 }}>
                        About This Event
                    </Typography>
                    <Typography paragraph sx={{ color: '#e0e0e0' }}>
                        {event.description}
                    </Typography>
                </Box>

                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ color: '#90caf9', mb: 1 }}>
                        Event Time
                    </Typography>
                    <Typography sx={{ color: '#e0e0e0' }}>
                        {new Date(event.startDate).toLocaleString()}
                    </Typography>
                </Box>

                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ color: '#90caf9', mb: 2 }}>
                        Time Until Event
                    </Typography>
                    {renderCountdown()}
                </Box>

                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ color: '#90caf9', mb: 2 }}>
                        Attendees ({attendees.length})
                    </Typography>
                    <List sx={{ 
                        bgcolor: 'rgba(255,255,255,0.05)',
                        borderRadius: 1,
                        p: 1
                    }}>
                        {attendees.map((attendee, index) => (
                            <React.Fragment key={attendee._id}>
                                <ListItem>
                                    <ListItemAvatar>
                                        <Avatar sx={{ 
                                            bgcolor: '#1a237e',
                                            color: '#fff'
                                        }}>
                                            {attendee.username[0].toUpperCase()}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText 
                                        primary={attendee.username} 
                                        sx={{ color: '#e0e0e0' }}
                                    />
                                </ListItem>
                                {index < attendees.length - 1 && (
                                    <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
                                )}
                            </React.Fragment>
                        ))}
                    </List>
                </Box>

                <Button
                    variant="contained"
                    onClick={handleAttendance}
                    startIcon={isGoing ? <PersonRemoveIcon /> : <PersonAddIcon />}
                    sx={{
                        width: '100%',
                        p: 1.5,
                        bgcolor: isGoing ? '#d32f2f' : '#1a237e',
                        '&:hover': {
                            bgcolor: isGoing ? '#b71c1c' : '#0d47a1'
                        },
                        textTransform: 'none',
                        fontSize: '1.1rem'
                    }}
                >
                    {isGoing ? 'Cancel Attendance' : 'Attend Event'}
                </Button>
            </Paper>

            <Snackbar
                open={showSnackbar}
                autoHideDuration={6000}
                onClose={() => setShowSnackbar(false)}
            >
                <Alert 
                    onClose={() => setShowSnackbar(false)} 
                    severity={error ? "error" : "success"}
                    sx={{ width: '100%' }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default CountdownTimer;
