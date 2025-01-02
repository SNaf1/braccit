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
    const { eventId } = useParams();
    const [timeLeft, setTimeLeft] = useState(null);
    const [eventDetails, setEventDetails] = useState(null);
    const [attendees, setAttendees] = useState([]);
    const [isGoing, setIsGoing] = useState(false);
    const [error, setError] = useState('');
    const [showSnackbar, setShowSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    // Fetch event details and attendees
    useEffect(() => {
        const fetchEventData = async () => {
            try {
                const eventResponse = await axios.get(`/api/b/events/${eventId}`);
                setEventDetails(eventResponse.data);
                
                // Check if current user is going
                const userIsGoing = eventResponse.data.going?.some(
                    user => user._id === eventResponse.data.currentUser?._id
                );
                setIsGoing(userIsGoing);

                // Set attendees directly from the populated going field
                setAttendees(eventResponse.data.going || []);
            } catch (error) {
                console.error('Error fetching event:', error);
                setError('Failed to load event details');
            }
        };
        fetchEventData();
    }, [eventId]);

    // Update countdown every second
    useEffect(() => {
        if (!eventDetails?.startTime) return;

        const calculateTimeLeft = () => {
            const now = new Date().getTime();
            const eventTime = new Date(eventDetails.startTime).getTime();
            const difference = eventTime - now;

            if (difference <= 0) {
                setTimeLeft(null);
                return;
            }

            setTimeLeft({
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((difference % (1000 * 60)) / 1000)
            });
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);
        return () => clearInterval(timer);
    }, [eventDetails]);

    const handleToggleGoing = async () => {
        try {
            await axios.post(`/api/b/events/${eventId}/going`);
            setIsGoing(!isGoing);
            
            // Fetch updated event details
            const updatedEvent = await axios.get(`/api/b/events/${eventId}`);
            setAttendees(updatedEvent.data.going || []);
            
            setSnackbarMessage(isGoing ? 'You are no longer attending' : 'You are now attending!');
            setShowSnackbar(true);
        } catch (error) {
            console.error('Error toggling attendance:', error);
            setError('Failed to update attendance');
            setShowSnackbar(true);
        }
    };

    if (!eventDetails) {
        return null;
    }

    return (
        <Container maxWidth="md">
            <Paper elevation={3} sx={{ p: 4, mt: 3, borderRadius: 2 }}>
                {/* Event Title */}
                <Box sx={{ mb: 4, borderBottom: 1, borderColor: 'divider', pb: 2 }}>
                    <Typography 
                        variant="h3" 
                        component="h1" 
                        gutterBottom 
                        sx={{ 
                            color: 'primary.main', 
                            fontWeight: 'bold',
                            textAlign: 'center'
                        }}
                    >
                        {eventDetails.title}
                    </Typography>
                </Box>

                {/* Event Description */}
                <Box sx={{ 
                    mb: 4, 
                    p: 3, 
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    border: 1,
                    borderColor: 'divider'
                }}>
                    <Typography 
                        variant="h6" 
                        gutterBottom 
                        sx={{ color: 'primary.main', mb: 2 }}
                    >
                        About This Event
                    </Typography>
                    <Typography 
                        variant="body1" 
                        paragraph 
                        sx={{ 
                            fontSize: '1.1rem', 
                            color: 'text.secondary',
                            lineHeight: 1.8,
                            whiteSpace: 'pre-line'
                        }}
                    >
                        {eventDetails.description}
                    </Typography>
                </Box>

                {/* Timer Section */}
                <Box sx={{ 
                    bgcolor: 'background.paper', 
                    p: 3, 
                    borderRadius: 1,
                    border: 1,
                    borderColor: 'divider'
                }}>
                    <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                        Event Time
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2, fontWeight: 'medium' }}>
                        {new Date(eventDetails.startTime).toLocaleString()}
                    </Typography>

                    <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mt: 2 }}>
                        Time Until Event
                    </Typography>
                    <Box sx={{ 
                        display: 'flex', 
                        gap: 2, 
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        p: 2,
                        bgcolor: 'primary.light',
                        borderRadius: 1,
                        color: 'white'
                    }}>
                        {!timeLeft ? (
                            <Typography variant="h5">Event has started!</Typography>
                        ) : (
                            <>
                                <Box sx={{ textAlign: 'center', minWidth: '80px' }}>
                                    <Typography variant="h4">{String(timeLeft.days).padStart(2, '0')}</Typography>
                                    <Typography variant="body2">Days</Typography>
                                </Box>
                                <Box sx={{ textAlign: 'center', minWidth: '80px' }}>
                                    <Typography variant="h4">{String(timeLeft.hours).padStart(2, '0')}</Typography>
                                    <Typography variant="body2">Hours</Typography>
                                </Box>
                                <Box sx={{ textAlign: 'center', minWidth: '80px' }}>
                                    <Typography variant="h4">{String(timeLeft.minutes).padStart(2, '0')}</Typography>
                                    <Typography variant="body2">Minutes</Typography>
                                </Box>
                                <Box sx={{ textAlign: 'center', minWidth: '80px' }}>
                                    <Typography variant="h4">{String(timeLeft.seconds).padStart(2, '0')}</Typography>
                                    <Typography variant="body2">Seconds</Typography>
                                </Box>
                            </>
                        )}
                    </Box>
                </Box>

                {/* Attendance Section */}
                <Box sx={{ mt: 4 }}>
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        mb: 2
                    }}>
                        <Typography variant="h6" sx={{ color: 'primary.main' }}>
                            Attendees ({attendees.length})
                        </Typography>
                        <Button
                            variant="contained"
                            color={isGoing ? "error" : "primary"}
                            onClick={handleToggleGoing}
                            startIcon={isGoing ? <PersonRemoveIcon /> : <PersonAddIcon />}
                        >
                            {isGoing ? "Not Going" : "Going"}
                        </Button>
                    </Box>

                    <Paper elevation={1} sx={{ p: 2, bgcolor: 'background.paper' }}>
                        {attendees.length > 0 ? (
                            <List>
                                {attendees.map((attendee, index) => (
                                    <React.Fragment key={attendee._id}>
                                        <ListItem>
                                            <ListItemAvatar>
                                                <Avatar>{attendee.username[0].toUpperCase()}</Avatar>
                                            </ListItemAvatar>
                                            <ListItemText 
                                                primary={attendee.username}
                                                secondary={attendee._id === eventDetails.currentUser?._id ? '(You)' : ''}
                                            />
                                        </ListItem>
                                        {index < attendees.length - 1 && <Divider />}
                                    </React.Fragment>
                                ))}
                            </List>
                        ) : (
                            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                                No attendees yet. Be the first to join!
                            </Typography>
                        )}
                    </Paper>
                </Box>
            </Paper>

            <Snackbar
                open={showSnackbar}
                autoHideDuration={3000}
                onClose={() => setShowSnackbar(false)}
            >
                <Alert 
                    onClose={() => setShowSnackbar(false)} 
                    severity={error ? "error" : "success"}
                >
                    {error || snackbarMessage}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default CountdownTimer;
