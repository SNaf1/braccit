import React, { useState, useEffect } from 'react';
import Event from '../Event/Event';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Avatar,
  Skeleton,
  Alert,
  Chip,
  Divider,
  IconButton,
  Dialog,
  Snackbar,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import GroupIcon from '@mui/icons-material/Group';
import LockIcon from '@mui/icons-material/Lock';
import PublicIcon from '@mui/icons-material/Public';
import SettingsIcon from '@mui/icons-material/Settings';
import CloseIcon from '@mui/icons-material/Close';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../../contexts/AuthContext';
import PostList from '../Post/PostList';
import axios from '../../utils/axios';
import CommunitySettings from './CommunitySettings';

const BannerImage = styled('div')(({ theme }) => ({
  width: '100%',
  height: '200px',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  position: 'relative',
  marginBottom: theme.spacing(2),
}));

const BannerTitle = styled('div')(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  padding: theme.spacing(2),
  background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, transparent 100%)',
  color: 'white',
  '& h1': {
    margin: 0,
    fontSize: '2rem',
    fontWeight: 500,
  },
  '& .subtitle': {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginTop: theme.spacing(0.5),
  }
}));

const MainContent = styled(Box)(({ theme }) => ({
  maxWidth: '1200px',
  margin: '0 auto',
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(3),
  },
}));

const getBannerUrl = (bannerImage) => {
  if (!bannerImage) return null;
  if (bannerImage.startsWith('http')) return bannerImage;
  const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  return `${baseUrl}/uploads/${bannerImage}`;
};

const CommunityDetail = () => {
  const { name } = useParams();
  const { user } = useAuth();
  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchCommunityDetails();
    if (name) {
      // Reset posts when community changes
      setPosts([]);
      setPage(1);
      setHasMore(true);
      fetchCommunityPosts(1, true);
    }
  }, [name]);

  const fetchCommunityDetails = async () => {
    try {
      const { data } = await axios.get(`/api/b/${name}`);
      setCommunity(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch community details');
    } finally {
      setLoading(false);
    }
  };

  const fetchCommunityPosts = async (pageNum, reset = false) => {
    if (loadingMore && !reset) return;
    setLoadingMore(true);
    try {
      const { data } = await axios.get(`/api/b/${name}/posts?page=${pageNum}&limit=10`);
      setPosts(prevPosts => {
        if (reset) return data;
        // Filter out duplicates based on post ID
        const newPosts = data.filter(newPost => 
          !prevPosts.some(existingPost => existingPost._id === newPost._id)
        );
        return [...prevPosts, ...newPosts];
      });
      setHasMore(data.length === 10);
    } catch (err) {
      console.error('Error fetching posts:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchCommunityPosts(nextPage);
  };

  const handleJoinRequest = async () => {
    if (!user) return;

    try {
      await axios.post(`/api/b/${name}/join`);
      fetchCommunityDetails();
      setSnackbar({
        open: true,
        message: community.isPrivate ? 'Join request sent' : 'Joined community',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.error || 'Failed to join community',
        severity: 'error'
      });
    }
  };

  const handleCancelJoinRequest = async () => {
    try {
      await axios.post(`/api/b/${name}/cancel-join`);
      fetchCommunityDetails();
      setSnackbar({
        open: true,
        message: 'Join request cancelled',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.error || 'Failed to cancel join request',
        severity: 'error'
      });
    }
  };

  const handleLeaveCommunity = async () => {
    try {
      await axios.post(`/api/b/${name}/leave`);
      fetchCommunityDetails();
      setSnackbar({
        open: true,
        message: 'Left community successfully',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.error || 'Failed to leave community',
        severity: 'error'
      });
    }
  };

  if (loading) return <Skeleton variant="rectangular" height={200} />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!community) return <Alert severity="error">Community not found</Alert>;

  return (
    <Box>
      <BannerImage
        sx={{
          backgroundImage: community.bannerImage 
            ? `url(${getBannerUrl(community.bannerImage)})`
            : 'none',
          backgroundColor: '#1a1a1b',
        }}
      >
        <BannerTitle>
          <Typography variant="h1" component="h1">
            b/{community.name}
          </Typography>
          <div className="subtitle">
            <Chip
              icon={community.isPrivate ? <LockIcon /> : <PublicIcon />}
              label={community.isPrivate ? 'Private' : 'Public'}
              color={community.isPrivate ? 'secondary' : 'primary'}
              size="small"
              sx={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
            />
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <GroupIcon fontSize="small" />
              {community.memberCount} member{community.memberCount !== 1 ? 's' : ''}
            </Typography>
          </div>
        </BannerTitle>
      </BannerImage>

      <Box sx={{ display: 'flex', gap: 2, maxWidth: 1200, mx: 'auto', px: 2 }}>
        {/* Main Content - Posts */}
        <Box sx={{ flex: 2, maxWidth: '100%' }}>
          {community.restricted ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              {community.message}
            </Alert>
          ) : (
            <>
              <PostList posts={posts} />
              {hasMore && (
                <Button
                  onClick={handleLoadMore}
                  fullWidth
                  variant="outlined"
                  sx={{ mt: 2 }}
                  disabled={loadingMore}
                >
                  {loadingMore ? 'Loading...' : 'Load More Posts'}
                </Button>
              )}
            </>
          )}
        </Box>

        {/* Right Sidebar - Community Details */}
        <Box sx={{ 
          flex: '0 0 320px', 
          display: { xs: 'none', md: 'block' }
        }}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 2, 
              position: 'sticky', 
              top: 80,
              backgroundColor: 'background.paper'
            }}
          >
            <Typography variant="h6" gutterBottom>
              About b/{community.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {community.description}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <GroupIcon sx={{ mr: 1 }} />
              <Typography variant="body2">
                {community.memberCount} member{community.memberCount !== 1 ? 's' : ''}
              </Typography>
            </Box>

            {user && (
              <Box sx={{ mt: 2 }}>
                {community.isMember ? (
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={handleLeaveCommunity}
                    startIcon={<LogoutIcon />}
                    disabled={community.owner?._id === user._id}
                    fullWidth
                  >
                    Leave Community
                  </Button>
                ) : community.hasPendingRequest ? (
                  <Button
                    variant="outlined"
                    color="warning"
                    onClick={handleCancelJoinRequest}
                    startIcon={<CloseIcon />}
                    fullWidth
                  >
                    Cancel Join Request
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleJoinRequest}
                    startIcon={<PersonAddIcon />}
                    fullWidth
                  >
                    {community.isPrivate ? 'Request to Join' : 'Join'}
                  </Button>
                )}
              </Box>
            )}

            {/* Community Events Section */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Community Events
              </Typography>
              {community._id && <Event communityId={community._id} />}
            </Box>

            {community.isAdmin && (
              <Button
                onClick={() => setSettingsOpen(true)}
                startIcon={<SettingsIcon />}
                fullWidth
                sx={{ mt: 1 }}
              >
                Community Settings
              </Button>
            )}
          </Paper>
        </Box>
      </Box>

      <Dialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <CommunitySettings
          community={community}
          onUpdate={fetchCommunityDetails}
          onClose={() => setSettingsOpen(false)}
        />
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        severity={snackbar.severity}
      />
    </Box>
  );
};

export default CommunityDetail;