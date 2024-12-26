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
import { Group as GroupIcon } from '@mui/icons-material';

const CommunityCard = ({ community }) => {
    return (
        <Card sx={{ mb: 2, width: '100%' }}>
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
                            <Typography variant="body2" color="text.secondary">
                                {community.members?.length || 0} members
                            </Typography>
                        </Box>
                    </Box>
                    
                    {community.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
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
