import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../../utils/axios';

const CountdownTimer = () => {
    const { eventId } = useParams();
    const [timeLeft, setTimeLeft] = useState(null);
    const [communityId, setCommunityId] = useState(null);

    useEffect(() => {
        // Fetch the event details using the eventId
        const fetchEvent = async () => {
            try {
                console.log('Event ID:', eventId);
                // First, get the community ID for this event
                const eventResponse = await axios.get(`/api/b/events/${eventId}`);
                console.log('Fetched event data:', eventResponse.data);
                const eventStartTime = new Date(eventResponse.data.startTime);
                console.log('Event start time:', eventStartTime);
                updateTimeLeft(eventStartTime);
            } catch (error) {
                console.error('Error fetching event:', error);
            }
        };

        fetchEvent();

        const intervalId = setInterval(() => {
            if (timeLeft) {
                updateTimeLeft(timeLeft);
            }
        }, 1000);

        return () => clearInterval(intervalId);
    }, [eventId, timeLeft]);

    const updateTimeLeft = (eventStartTime) => {
        const now = new Date();
        console.log('Current time:', now);
        const difference = eventStartTime - now;
        console.log('Time difference:', difference);

        if (difference > 0) {
            const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((difference / 1000 / 60) % 60);
            const seconds = Math.floor((difference / 1000) % 60);
            setTimeLeft({ hours, minutes, seconds });
        } else {
            setTimeLeft(null);
        }
    };

    if (!timeLeft) {
        return <div>The event has started or there is no event information available.</div>;
    }

    return (
        <div>
            <h2>Countdown to Event</h2>
            <p>{`${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s`}</p>
        </div>
    );
};

export default CountdownTimer;
