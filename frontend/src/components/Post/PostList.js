import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    IconButton,
    Button,
    Divider,
    Card,
    CardContent,
    CardActions,
    CardHeader,
    Avatar,
    Link as MuiLink
} from '@mui/material';
import {
    ArrowUpward as ArrowUpwardIcon,
    ArrowDownward as ArrowDownwardIcon,
    Comment as CommentIcon
} from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import axios from '../../utils/axios';
import { alpha } from '@mui/material/styles';

const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    return `${baseUrl}/${imagePath}`;
};

const PostList = ({ posts: initialPosts = [] }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [posts, setPosts] = useState(initialPosts);

    useEffect(() => {
        setPosts(initialPosts);
    }, [initialPosts]);

    const handleVote = async (e, postId, voteType) => {
        e.stopPropagation(); // Prevent post click
        if (!user) {
            navigate('/login');
            return;
        }

        try {
            // Find the current post
            const currentPost = posts.find(p => p._id === postId);
            if (!currentPost) return;

            // Calculate vote change before making the request
            const oldVote = currentPost.userVote;
            const newVote = oldVote === voteType ? null : voteType;

            // Update UI immediately
            setPosts(prevPosts => 
                prevPosts.map(post => 
                    post._id === postId 
                        ? {
                            ...post,
                            userVote: newVote,
                            voteScore: calculateNewScore(post.voteScore, oldVote, newVote)
                        }
                        : post
                )
            );

            // Make API call
            const response = await axios.post(`/api/posts/${postId}/vote`, { voteType: newVote });
            
            // Update with server response
            setPosts(prevPosts => 
                prevPosts.map(post => 
                    post._id === postId 
                        ? {
                            ...post,
                            upvotes: response.data.upvotes,
                            downvotes: response.data.downvotes,
                            userVote: response.data.userVote,
                            voteScore: response.data.upvotes.length - response.data.downvotes.length
                        }
                        : post
                )
            );
        } catch (err) {
            console.error('Error voting:', err);
            // Refresh the specific post on error
            try {
                const response = await axios.get(`/api/posts/${postId}`);
                setPosts(prevPosts => 
                    prevPosts.map(post => 
                        post._id === postId ? response.data : post
                    )
                );
            } catch (refreshErr) {
                console.error('Error refreshing post:', refreshErr);
            }
        }
    };

    // Helper function to calculate new score
    const calculateNewScore = (currentScore, oldVote, newVote) => {
        let score = currentScore || 0;
        
        // Remove old vote
        if (oldVote === 'up') score--;
        if (oldVote === 'down') score++;
        
        // Add new vote
        if (newVote === 'up') score++;
        if (newVote === 'down') score--;
        
        return score;
    };

    const handlePostClick = (postId) => {
        navigate(`/post/${postId}`);
    };

    const handleCommunityClick = (e, communityName) => {
        e.stopPropagation(); // Prevent post click
        navigate(`/b/${communityName}`);
    };

    if (!Array.isArray(posts)) {
        return null;
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {posts.map((post) => (
                <Card 
                    key={post._id} 
                    sx={{ 
                        width: '100%',
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'action.hover' }
                    }}
                    onClick={() => handlePostClick(post._id)}
                >
                    <CardHeader
                        avatar={
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                                {post.author?.username?.[0]?.toUpperCase() || 'U'}
                            </Avatar>
                        }
                        title={
                            <Typography variant="h6">
                                {post.title}
                            </Typography>
                        }
                        subheader={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <MuiLink
                                    component="button"
                                    variant="subtitle2"
                                    onClick={(e) => handleCommunityClick(e, post.community?.name)}
                                    sx={{ 
                                        textDecoration: 'none',
                                        '&:hover': { textDecoration: 'underline' }
                                    }}
                                >
                                    b/{post.community?.name}
                                </MuiLink>
                                <Typography variant="subtitle2" color="text.secondary">
                                    • Posted by u/{post.author?.username}
                                </Typography>
                                <Typography variant="subtitle2" color="text.secondary">
                                    • {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                                </Typography>
                            </Box>
                        }
                    />
                    <CardContent>
                        <Typography variant="body1" color="text.primary" sx={{ mb: 2 }}>
                            {post.content}
                        </Typography>
                        {post.images && post.images.length > 0 && (
                            <Box 
                                sx={{ 
                                    display: 'flex', 
                                    justifyContent: 'center',
                                    mb: 2,
                                    '& img': {
                                        maxWidth: '100%',
                                        maxHeight: '500px',
                                        objectFit: 'contain'
                                    }
                                }}
                            >
                                <img 
                                    src={getImageUrl(post.images[0])} 
                                    alt={post.title}
                                />
                            </Box>
                        )}
                    </CardContent>
                    <CardActions disableSpacing>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconButton 
                                onClick={(e) => handleVote(e, post._id, 'up')}
                                sx={{
                                    color: post.userVote === 'up' ? '#1976d2' : 'grey.500'
                                }}
                            >
                                <ArrowUpwardIcon />
                            </IconButton>
                            <Typography 
                                sx={{
                                    color: post.userVote === 'up' ? '#1976d2' : 
                                          post.userVote === 'down' ? '#d32f2f' : 
                                          'text.primary',
                                    fontWeight: post.userVote ? 600 : 400
                                }}
                            >
                                {post.voteScore || 0}
                            </Typography>
                            <IconButton 
                                onClick={(e) => handleVote(e, post._id, 'down')}
                                sx={{
                                    color: post.userVote === 'down' ? '#d32f2f' : 'grey.500'
                                }}
                            >
                                <ArrowDownwardIcon />
                            </IconButton>
                            <IconButton 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/post/${post._id}`);
                                }}
                            >
                                <CommentIcon />
                                <Typography sx={{ ml: 1 }}>
                                    {post.comments?.length || 0}
                                </Typography>
                            </IconButton>
                        </Box>
                    </CardActions>
                </Card>
            ))}
        </Box>
    );
};

export default PostList;
