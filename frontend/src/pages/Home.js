import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Skeleton,
  Alert
} from '@mui/material';
import PostList from '../components/Post/PostList';
import { useAuth } from '../contexts/AuthContext';
import axios from '../utils/axios';

const Home = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    // Reset and fetch posts when user auth state changes
    setPage(1);
    setPosts([]);
    fetchFeed(1, true);
  }, [user]); // Depend on user to refetch when auth state changes

  const fetchFeed = async (pageNum, reset = false) => {
    if (loadingMore && !reset) return;
    setLoadingMore(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const endpoint = user ? '/api/posts/feed' : '/api/posts';
      const { data } = await axios.get(`${endpoint}?page=${pageNum}&limit=10`, { headers });
      
      setPosts(prevPosts => {
        if (reset) return data;
        // Filter out duplicates based on post ID
        const newPosts = data.filter(newPost => 
          !prevPosts.some(existingPost => existingPost._id === newPost._id)
        );
        return [...prevPosts, ...newPosts];
      });
      setHasMore(data.length === 10);
      setError(null);
    } catch (err) {
      console.error('Feed error:', err);
      setError(err.response?.data?.error || 'Failed to fetch posts');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchFeed(nextPage);
  };

  if (loading) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
        <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={200} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={() => fetchFeed(1, true)}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      {posts.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            {user ? 'Your feed is empty' : 'Welcome to Braccit!'}
          </Typography>
          <Typography color="text.secondary" paragraph>
            {user 
              ? 'Join some communities to see posts in your feed!'
              : 'Sign in to see your personalized feed and join communities.'
            }
          </Typography>
          <Button
            variant="contained"
            color="primary"
            href="/communities"
          >
            Browse Communities
          </Button>
        </Paper>
      ) : (
        <>
          <PostList posts={posts} />
          {hasMore && (
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Button
                variant="outlined"
                onClick={handleLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? 'Loading...' : 'Load More'}
              </Button>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default Home;
