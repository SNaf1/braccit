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
  School as SchoolIcon,
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
        top: 64,
        height: 'calc(100vh - 64px)',
        overflowY: 'auto',
        backgroundColor: '#1a1a1b',
        borderRight: '1px solid #343536',
        color: '#d7dadc'
      }}
    >
      <List>
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

        <ListItem>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => navigate('/create-community')}
            sx={{
              borderColor: '#2196f3',
              color: '#2196f3',
              '&:hover': {
                borderColor: '#1976d2',
                backgroundColor: 'rgba(33, 150, 243, 0.08)'
              }
            }}
          >
            Create Community
          </Button>
        </ListItem>

        {user && (
          <ListItem sx={{ mt: 1 }}>
            <Button
              fullWidth
              variant="outlined"
              color="primary"
              startIcon={<SchoolIcon />}
              onClick={() => navigate('/courses')}
              sx={{ 
                color: 'white',
                borderColor: 'rgba(255, 255, 255, 0.5)',
                '&:hover': {
                  borderColor: 'white'
                }
              }}
            >
              My Courses
            </Button>
          </ListItem>
        )}

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
