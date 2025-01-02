import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Paper, Container } from '@mui/material';
import axios from '../../utils/axios';

const CountdownTimer = () => {
    const { eventId } = useParams();
    const [timeLeft, setTimeLeft] = useState(null);
    const [eventDetails, setEventDetails] = useState(null);

    // Fetch event details only once
    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const eventResponse = await axios.get(`/api/b/events/${eventId}`);
                setEventDetails(eventResponse.data);
            } catch (error) {
                console.error('Error fetching event:', error);
            }
        };
        fetchEvent();
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

        // Calculate immediately
        calculateTimeLeft();

        // Update every second
        const timer = setInterval(calculateTimeLeft, 1000);

        // Cleanup interval on unmount or when event details change
        return () => clearInterval(timer);
    }, [eventDetails]);

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
            </Paper>
        </Container>
    );
};

export default CountdownTimer;
