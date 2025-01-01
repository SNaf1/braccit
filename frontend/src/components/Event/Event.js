import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText,
    CircularProgress,
    Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';
import { useAuth } from '../../contexts/AuthContext';

const Event = ({ communityId }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        startTime: '',
    });

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await axios.get(`/api/b/${communityId}/events`);
                setEvents(response.data);
            } catch (err) {
                if (err.response && err.response.status === 403) {
                    setError('Access denied: You must be a member of the community to view events.');
                } else {
                    setError('Error fetching events: ' + (err.response?.data?.error || err.message));
                }
            } finally {
                setLoading(false);
            }
        };

        if (communityId) {
            fetchEvents();
        }
    }, [communityId]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`/api/b/${communityId}/events`, formData);
            setOpen(false);
            setFormData({ title: '', description: '', startTime: '' });
            const response = await axios.get(`/api/b/${communityId}/events`);
            setEvents(response.data);
        } catch (err) {
            setError('Error creating event: ' + (err.response?.data?.error || err.message));
        }
    };

    if (loading) {
        return <CircularProgress />;
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    return (
        <Box>
            <Button variant="contained" onClick={() => setOpen(true)}>
                Create Event
            </Button>
            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Create Event</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="Description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        margin="normal"
                        multiline
                        rows={4}
                    />
                    <TextField
                        fullWidth
                        label="Start Time"
                        name="startTime"
                        type="datetime-local"
                        value={formData.startTime}
                        onChange={handleChange}
                        margin="normal"
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        Create
                    </Button>
                </DialogActions>
            </Dialog>
            <List>
                {events.map((event) => (
                    <ListItem 
                        key={event._id} 
                        button 
                        onClick={() => navigate(`/event/${event._id}`)}
                    >
                        <ListItemText
                            primary={event.title}
                            secondary={`Starts at: ${new Date(event.startTime).toLocaleString()}`}
                        />
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};

export default Event;