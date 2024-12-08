import React from 'react';
import { Link } from 'react-router-dom';
import {
    Card,
    CardContent,
    CardActionArea,
    Typography,
    Box,
    Chip,
    Avatar
} from '@mui/material';
import {
    Comment as CommentIcon,
    ThumbUp as ThumbUpIcon,
    Schedule as ScheduleIcon
} from '@mui/icons-material';

const PostCard = ({ post }) => {
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(date);
    };

    return (
        <Card sx={{ mb: 2, width: '100%' }}>
            <CardActionArea component={Link} to={`/post/${post._id}`}>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Avatar 
                            src={post.author?.profilePicture}
                            alt={post.author?.username}
                            sx={{ width: 32, height: 32, mr: 1 }}
                        >
                            {post.author?.username?.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="subtitle2" component="span">
                                {post.author?.username}
                            </Typography>
                            <Typography 
                                variant="caption" 
                                color="text.secondary"
                                sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                            >
                                <ScheduleIcon sx={{ fontSize: 14 }} />
                                {formatDate(post.createdAt)}
                                {post.community && (
                                    <>
                                        {' • '}
                                        <Link 
                                            to={`/community/${post.community._id}`}
                                            onClick={(e) => e.stopPropagation()}
                                            style={{ color: 'inherit', textDecoration: 'none' }}
                                        >
                                            {post.community.name}
                                        </Link>
                                    </>
                                )}
                            </Typography>
                        </Box>
                    </Box>

                    <Typography variant="h6" component="div" sx={{ mb: 1 }}>
                        {post.title}
                    </Typography>

                    <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                            mb: 2,
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                        }}
                    >
                        {post.content}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Chip
                            icon={<ThumbUpIcon />}
                            label={post.likes?.length || 0}
                            size="small"
                            variant="outlined"
                        />
                        <Chip
                            icon={<CommentIcon />}
                            label={post.comments?.length || 0}
                            size="small"
                            variant="outlined"
                        />
                        {post.tags?.map((tag, index) => (
                            <Chip
                                key={index}
                                label={tag}
                                size="small"
                                variant="outlined"
                            />
                        ))}
                    </Box>
                </CardContent>
            </CardActionArea>
        </Card>
    );
};

export default PostCard;
