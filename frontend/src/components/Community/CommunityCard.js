import React from 'react';
import { Link } from 'react-router-dom';
import {
    Card,
    CardContent,
    CardActionArea,
    Typography,
    Box,
    Chip,
    Avatar,
    CardActions
} from '@mui/material';
import { Group as GroupIcon } from '@mui/icons-material';

const CommunityCard = ({ community }) => {
    const displayMemberCount = () => {
        if (community.memberCount === 0) return '0 members';
        if (community.memberCount === 1) return '1 member';
        return `${community.memberCount} members`;
    };

    return (
        <Card sx={{ mb: 2, backgroundColor: '#1a1a1b', color: 'white' }}>
            <CardActionArea component={Link} to={`/b/${community.name.toLowerCase().replace(/\s+/g, '')}`}>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Avatar 
                            src={community.avatar}
                            alt={community.name}
                            sx={{ width: 40, height: 40, mr: 2 }}
                        >
                            {community.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                            <Typography variant="h6" component="div">
                                {community.name}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                {displayMemberCount()}
                            </Typography>
                        </Box>
                    </Box>
                    
                    {community.description && (
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 1, mt: 1, color: '#d7dadc' }}>
                            {community.description}
                        </Typography>
                    )}

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip
                            icon={<GroupIcon />}
                            label={community.isPrivate ? 'Private' : 'Public'}
                            size="small"
                            color={community.isPrivate ? 'secondary' : 'primary'}
                            variant="outlined"
                        />
                        {community.tags?.map((tag, index) => (
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

export default CommunityCard;
