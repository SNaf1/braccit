import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
    Container, 
    Typography, 
    Box, 
    CircularProgress, 
    Alert,
    Tabs,
    Tab
} from '@mui/material';
import axiosInstance from '../utils/axios';
import CommunityCard from '../components/Community/CommunityCard';
import PostCard from '../components/Post/PostCard';

const SearchResults = () => {
    const [results, setResults] = useState({ communities: [], posts: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState(0);
    const location = useLocation();
    const searchQuery = new URLSearchParams(location.search).get('q');

    useEffect(() => {
        const fetchResults = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Fetch both communities and posts in parallel
                const [communitiesResponse, postsResponse] = await Promise.all([
                    axiosInstance.get(`/api/search/communities?query=${encodeURIComponent(searchQuery)}`),
                    axiosInstance.get(`/api/search/posts?query=${encodeURIComponent(searchQuery)}`)
                ]);

                setResults({
                    communities: communitiesResponse.data,
                    posts: postsResponse.data
                });
            } catch (error) {
                console.error('Search error:', error);
                setError(error.response?.data?.error || 'Error fetching search results');
            } finally {
                setLoading(false);
            }
        };

        if (searchQuery) {
            fetchResults();
        } else {
            setResults({ communities: [], posts: [] });
            setLoading(false);
        }
    }, [searchQuery]);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Alert severity="error">
                    {error}
                </Alert>
            </Container>
        );
    }

    if (!searchQuery) {
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Typography variant="h6" color="text.secondary" align="center">
                    Enter a search term to find communities and posts
                </Typography>
            </Container>
        );
    }

    const hasResults = results.communities.length > 0 || results.posts.length > 0;

    if (!hasResults) {
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Typography variant="h6" color="text.secondary" align="center">
                    No results found for "{searchQuery}"
                </Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Typography variant="h5" sx={{ mb: 3 }}>
                Search Results for "{searchQuery}"
            </Typography>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={activeTab} onChange={handleTabChange}>
                    <Tab 
                        label={`Communities (${results.communities.length})`}
                        id="search-tab-0"
                    />
                    <Tab 
                        label={`Posts (${results.posts.length})`}
                        id="search-tab-1"
                    />
                </Tabs>
            </Box>

            {activeTab === 0 && (
                <Box>
                    {results.communities.map((community) => (
                        <CommunityCard 
                            key={community._id} 
                            community={community}
                        />
                    ))}
                </Box>
            )}

            {activeTab === 1 && (
                <Box>
                    {results.posts.map((post) => (
                        <PostCard 
                            key={post._id} 
                            post={post}
                        />
                    ))}
                </Box>
            )}
        </Container>
    );
};

export default SearchResults;
