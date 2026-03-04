import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Grid,
    Paper,
    CircularProgress,
    Button
} from '@mui/material';
import { Link } from 'react-router-dom';
import axios from '../utils/axios';
import CommunityCard from '../components/Community/CommunityCard';
import { useAuth } from '../contexts/AuthContext';

const Communities = () => {
    const [communities, setCommunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        const fetchCommunities = async () => {
            try {
                const response = await axios.get('/api/b');
                console.log('Communities before sorting:', response.data);
                
                // Sort communities by member count
                const sortedCommunities = [...response.data].sort((a, b) => {
                    const aCount = Array.isArray(a.members) ? a.members.length : 0;
                    const bCount = Array.isArray(b.members) ? b.members.length : 0;
                    return bCount - aCount;
                });
                
                console.log('Communities after sorting:', sortedCommunities);
                setCommunities(sortedCommunities);
                setError(null);
            } catch (err) {
                console.error('Error fetching communities:', err);
                setError('Failed to load communities');
            } finally {
                setLoading(false);
            }
        };

        fetchCommunities();
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container>
                <Typography color="error" align="center">
                    {error}
                </Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Popular Communities
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                    Discover and join the most active communities on BRACCIT
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    Sorted by number of members
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {communities.map((community) => (
                    <Grid item xs={12} sm={6} md={4} key={community._id}>
                        <CommunityCard 
                            community={{
                                ...community,
                                memberCount: Array.isArray(community.members) ? community.members.length : 0
                            }} 
                        />
                    </Grid>
                ))}
            </Grid>

            {communities.length === 0 && (
                <Box sx={{ textAlign: 'center', mt: 4 }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        No communities found
                    </Typography>
                    <Button 
                        variant="contained" 
                        color="primary"
                        component={Link}
                        to="/create-community"
                        sx={{ mt: 2 }}
                    >
                        Create a Community
                    </Button>
                </Box>
            )}
        </Container>
    );
};

export default Communities;
