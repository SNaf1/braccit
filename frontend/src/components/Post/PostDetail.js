import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    IconButton,
    Button,
    TextField,
    Divider,
    CircularProgress,
    Avatar
} from '@mui/material';
import {
    ArrowUpward as ArrowUpwardIcon,
    ArrowDownward as ArrowDownwardIcon,
    Send as SendIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import axios from '../../utils/axios';
import { useAuth } from '../../contexts/AuthContext';
import { alpha } from '@mui/material/styles';

const getImageUrl = (image) => `http://localhost:5000/${image}`;

const PostDetail = () => {
    const { postId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                console.log('Fetching post:', postId);
                const response = await axios.get(`/api/posts/${postId}`);
                console.log('Post data:', response.data);
                setPost(response.data);
                setError(null);
            } catch (err) {
                console.error('Error fetching post:', err);
                setError(err.response?.data?.error || 'Failed to fetch post');
                setPost(null);
            } finally {
                setLoading(false);
            }
        };

        if (postId) {
            setLoading(true);
            fetchPost();
        }
    }, [postId]);

    const handleVote = async (e, voteType) => {
        e.preventDefault();
        if (!user) {
            navigate('/login');
            return;
        }

        try {
            // Calculate vote change before making the request
            const oldVote = post.userVote;
            const newVote = oldVote === voteType ? null : voteType;

            // Update UI immediately
            setPost(prevPost => ({
                ...prevPost,
                userVote: newVote,
                voteScore: calculateNewScore(prevPost.voteScore, oldVote, newVote)
            }));

            // Make API call
            const response = await axios.post(`/api/posts/${postId}/vote`, { voteType: newVote });
            
            // Update with server response
            setPost(prevPost => ({
                ...prevPost,
                upvotes: response.data.upvotes,
                downvotes: response.data.downvotes,
                userVote: response.data.userVote,
                voteScore: response.data.upvotes.length - response.data.downvotes.length
            }));
        } catch (error) {
            console.error('Error voting:', error);
            // Refresh post data on error
            const response = await axios.get(`/api/posts/${postId}`);
            setPost(response.data);
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

    const handleComment = async (e) => {
        e.preventDefault();
        if (!user) {
            navigate('/login');
            return;
        }
        
        if (!comment.trim()) return;

        setSubmitting(true);
        try {
            console.log('Posting comment:', comment);
            const response = await axios.post(`/api/posts/${postId}/comments`, {
                content: comment.trim()
            });
            console.log('Comment response:', response.data);
            setPost(prev => ({
                ...prev,
                comments: [...prev.comments, response.data]
            }));
            setComment('');
        } catch (err) {
            console.error('Failed to post comment:', err);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Paper sx={{ p: 3, m: 2 }}>
                <Typography color="error">{error}</Typography>
                <Button 
                    variant="outlined" 
                    onClick={() => navigate(-1)} 
                    sx={{ mt: 2 }}
                >
                    Go Back
                </Button>
            </Paper>
        );
    }

    if (!post) return null;

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
            <Paper sx={{ p: 2, mb: 2 }}>
                {/* Post Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ mr: 1 }}>
                        {post.author?.username?.[0]?.toUpperCase() || 'U'}
                    </Avatar>
                    <Box>
                        <Typography 
                            variant="subtitle2" 
                            component="span"
                            onClick={() => navigate(`/b/${post.community?.name}`)}
                            sx={{ 
                                cursor: 'pointer',
                                '&:hover': { textDecoration: 'underline' }
                            }}
                        >
                            b/{post.community?.name}
                        </Typography>
                        <Typography variant="caption" sx={{ ml: 1 }}>
                            • Posted by u/{post.author?.username} {' '}
                            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                        </Typography>
                    </Box>
                </Box>

                {/* Post Content */}
                <Typography variant="h6" gutterBottom>
                    {post.title}
                </Typography>
                <Typography variant="body1" paragraph>
                    {post.content}
                </Typography>

                {/* Post Images */}
                {post.images && post.images.length > 0 && (
                    <Box sx={{ mt: 2, mb: 2 }}>
                        <img 
                            src={getImageUrl(post.images[0])} 
                            alt="Post content"
                            style={{ 
                                maxWidth: '100%', 
                                maxHeight: '600px',
                                objectFit: 'contain'
                            }} 
                        />
                    </Box>
                )}

                {/* Vote Actions */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <IconButton 
                        onClick={(e) => handleVote(e, 'up')}
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
                        onClick={(e) => handleVote(e, 'down')}
                        sx={{
                            color: post.userVote === 'down' ? '#d32f2f' : 'grey.500'
                        }}
                    >
                        <ArrowDownwardIcon />
                    </IconButton>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Comment Form */}
                {user ? (
                    <Box component="form" onSubmit={handleComment} sx={{ mb: 3 }}>
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="What are your thoughts?"
                            variant="outlined"
                            disabled={submitting}
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={!comment.trim() || submitting}
                            startIcon={submitting ? <CircularProgress size={20} /> : <SendIcon />}
                            sx={{ mt: 1 }}
                        >
                            {submitting ? 'Posting...' : 'Comment'}
                        </Button>
                    </Box>
                ) : (
                    <Button
                        variant="outlined"
                        onClick={() => navigate('/login')}
                        sx={{ mb: 3 }}
                    >
                        Log in to comment
                    </Button>
                )}

                {/* Comments */}
                <Typography variant="h6" gutterBottom>
                    Comments ({post.comments?.length || 0})
                </Typography>
                {post.comments?.map((comment) => (
                    <Paper key={comment._id} sx={{ p: 2, mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Avatar sx={{ width: 24, height: 24, mr: 1 }}>
                                {comment.author?.username?.[0]?.toUpperCase() || 'U'}
                            </Avatar>
                            <Typography variant="subtitle2">
                                {comment.author?.username}
                            </Typography>
                            <Typography variant="caption" sx={{ ml: 1 }}>
                                • {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                            </Typography>
                        </Box>
                        <Typography variant="body2">
                            {comment.content}
                        </Typography>
                    </Paper>
                ))}
            </Paper>
        </Box>
    );
};

export default PostDetail;
