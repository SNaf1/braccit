import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Typography,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Public as PublicIcon,
  Lock as LockIcon,
  PostAdd as PostAddIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import axios from '../../utils/axios';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userCommunities, setUserCommunities] = useState([]);

  useEffect(() => {
    if (user) {
      fetchUserCommunities();
    }
  }, [user]);

  const fetchUserCommunities = async () => {
    try {
      const { data } = await axios.get('/api/b/user');
      setUserCommunities(data);
    } catch (error) {
      console.error('Error fetching user communities:', error);
    }
  };

  return (
    <Box 
      sx={{ 
        width: 280,
        flexShrink: 0,
        position: 'sticky',
        top: 64, // Adjust based on your header height
        height: 'calc(100vh - 64px)',
        overflowY: 'auto',
        backgroundColor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(0,0,0,0.2)',
          borderRadius: '4px',
        },
      }}
    >
      <List sx={{ mt: 8 }}>
        <ListItem>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            startIcon={<PostAddIcon />}
            onClick={() => navigate('/create-post')}
          >
            Create Post
          </Button>
        </ListItem>
        
        <ListItem sx={{ mt: 1 }}>
          <Button
            fullWidth
            variant="outlined"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/create-community')}
            sx={{ 
              color: 'white',
              borderColor: 'rgba(255, 255, 255, 0.5)',
              '&:hover': {
                borderColor: 'white'
              }
            }}
          >
            Create Community
          </Button>
        </ListItem>

        <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.12)' }} />

        <ListItem>
          <Typography variant="subtitle1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Your Communities
          </Typography>
        </ListItem>

        {userCommunities.map((community) => (
          <ListItem
            key={community.name}
            button
            component={Link}
            to={`/b/${community.name}`}
            selected={location.pathname === `/b/${community.name}`}
            sx={{
              color: 'white',
              '&.Mui-selected': {
                bgcolor: 'rgba(255, 255, 255, 0.08)',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.12)'
                }
              },
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.04)'
              }
            }}
          >
            <ListItemIcon sx={{ color: 'white' }}>
              {community.isPrivate ? <LockIcon /> : <PublicIcon />}
            </ListItemIcon>
            <ListItemText 
              primary={community.name}
              secondary={`${community.memberCount} members`}
              secondaryTypographyProps={{
                sx: { color: 'rgba(255, 255, 255, 0.7)' }
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Sidebar;
