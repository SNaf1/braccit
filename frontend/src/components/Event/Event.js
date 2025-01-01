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
import axios from '../../utils/axios';
import { useAuth } from '../../contexts/AuthContext';

const Event = ({ communityId }) => {
    const { user } = useAuth();
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
                const response = await axios.get(`/api/${communityId}/events`);
                setEvents(response.data);
            } catch (err) {
                setError('Error fetching events');
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, [communityId]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`/api/${communityId}/events`, formData);
            setOpen(false);
            setFormData({ title: '', description: '', startTime: '' });
            const response = await axios.get(`/api/${communityId}/events`);
            setEvents(response.data);
        } catch (err) {
            setError('Error creating event');
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
                    <ListItem key={event._id}>
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