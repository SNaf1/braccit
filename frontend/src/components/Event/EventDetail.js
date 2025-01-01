import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    CircularProgress,
    Alert,
} from '@mui/material';
import axios from '../../utils/axios';
import { useAuth } from '../../contexts/AuthContext';

const EventDetail = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [going, setGoing] = useState(false);
    const [timeLeft, setTimeLeft] = useState({});

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                console.log('Fetching event with ID:', eventId); // Log the eventId
                const response = await axios.get(`/api/events/${eventId}`);
                setEvent(response.data);
                setGoing(response.data.going?.includes(user._id) || false);
            } catch (err) {
                console.error('Error fetching event details:', err);
                setError('Error fetching event details');
            } finally {
                setLoading(false);
            }
        };

        fetchEvent();
    }, [eventId, user._id]);

    const calculateTimeLeft = useCallback(() => {
        if (!event) return {};
        const difference = +new Date(event.startTime) - +new Date();
        let timeLeft = {};

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        }

        return timeLeft;
    }, [event]);

    useEffect(() => {
        const timer = setInterval(() => {
            const newTimeLeft = calculateTimeLeft();
            setTimeLeft(newTimeLeft);

            if (Object.keys(newTimeLeft).length === 0 && event) {
                // Event has started, navigate back to the community page
                navigate(`/b/${event.community}`);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [event, navigate, calculateTimeLeft]);

    const handleGoing = async (status) => {
        try {
            await axios.post(`/api/events/${eventId}/going`, { going: status });
            setGoing(status);
        } catch (err) {
            console.error('Error updating going status:', err);
            setError('Error updating going status');
        }
    };

    if (loading) {
        return <CircularProgress />;
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    if (!event) {
        return <Alert severity="error">Event not found</Alert>;
    }

    return (
        <Box>
            <Typography 
                variant="h6" 
                sx={{ 
                    textAlign: 'center', 
                    fontSize: '1.5rem', 
                    marginBottom: '1rem' 
                }}
            >
                Time left: {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
            </Typography>
            <Typography variant="h4">{event.title}</Typography>
            <Typography variant="body1">{event.description}</Typography>
            <Typography variant="body2">
                Starts at: {new Date(event.startTime).toLocaleString()}
            </Typography>
            <Button
                variant="contained"
                color={going ? "secondary" : "primary"}
                onClick={() => handleGoing(!going)}
            >
                {going ? "Not Going" : "Going"}
            </Button>
        </Box>
    );
};

export default EventDetail;