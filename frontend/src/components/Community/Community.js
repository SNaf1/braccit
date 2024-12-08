import React, { useState, useEffect } from 'react';
import {
    Container,
    Box,
    Typography,
    Button,
    Paper,
    CircularProgress,
    Alert,
    ToggleButtonGroup,
    ToggleButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    IconButton,
    InputAdornment,
} from '@mui/material';
import {
    Add as AddIcon,
    Settings as SettingsIcon,
    PersonAdd as PersonAddIcon,
    Check as CheckIcon,
    Clear as ClearIcon,
    Search as SearchIcon,
    Public as PublicIcon,
    Lock as LockIcon,
} from '@mui/icons-material';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import CreatePost from '../Post/CreatePost';
import PostList from '../Post/PostList';
import CreateCommunity from './CreateCommunity';

const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme }) => ({
        flexGrow: 1,
        padding: theme.spacing(3),
        paddingLeft: theme.spacing(1),
        marginLeft: 0,
        maxWidth: 'calc(100vw - 240px)',
    }),
);

const SearchContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing(3),
    width: '100%',
    maxWidth: '600px',
    margin: '0 auto',
}));

const SearchField = styled(TextField)(({ theme }) => ({
    width: '100%',
    '& .MuiOutlinedInput-root': {
        borderRadius: theme.shape.borderRadius * 2,
    },
}));

const Community = () => {
    const { name } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const [community, setCommunity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [posts, setPosts] = useState([]);
    const [sortBy, setSortBy] = useState('new');
    const [createPostOpen, setCreatePostOpen] = useState(false);
    const [pendingMembers, setPendingMembers] = useState([]);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [description, setDescription] = useState('');
    const [bannerImage, setBannerImage] = useState(null);
    const [open, setOpen] = useState(true);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [userCommunities, setUserCommunities] = useState([]);

    const getBannerUrl = (bannerImage) => {
        if (!bannerImage) return null;
        
        // If it's already a full URL, return it
        if (bannerImage.startsWith('http')) return bannerImage;
        
        // If it already includes /uploads/, don't add it again
        if (bannerImage.startsWith('/uploads/')) {
            const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
            return `${baseUrl}${bannerImage}`;
        }
        
        // Otherwise, construct the full URL to the uploads directory
        const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        return `${baseUrl}/uploads/${bannerImage}`;
    };

    const fetchCommunity = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `http://localhost:5000/api/b/${name}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setCommunity(response.data);
            setDescription(response.data.description);
        } catch (err) {
            setError(err.response?.data?.error || 'Error loading community');
        } finally {
            setLoading(false);
        }
    };

    const fetchPosts = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `http://localhost:5000/api/b/${name}/posts?sort=${sortBy}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setPosts(response.data);
        } catch (err) {
            console.error('Error fetching posts:', err);
        }
    };

    const fetchUserCommunities = async () => {
        try {
            const { data } = await axios.get('/api/b/user');
            setUserCommunities(data);
        } catch (error) {
            console.error('Error fetching user communities:', error);
        }
    };

    useEffect(() => {
        fetchCommunity();
        fetchUserCommunities();
    }, [name]);

    useEffect(() => {
        if (community) {
            fetchPosts();
        }
    }, [community, sortBy]);

    const handleJoinRequest = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `http://localhost:5000/api/b/${name}/join`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            fetchCommunity();
        } catch (err) {
            setError(err.response?.data?.error || 'Error joining community');
        }
    };

    const handleApproveRequest = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `http://localhost:5000/api/b/${name}/approve`,
                { userId },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            fetchCommunity();
        } catch (err) {
            setError(err.response?.data?.error || 'Error approving request');
        }
    };

    const handleUpdateCommunity = async () => {
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('description', description);
            if (bannerImage) {
                formData.append('bannerImage', bannerImage);
            }

            await axios.put(
                `http://localhost:5000/api/b/${name}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            setSettingsOpen(false);
            fetchCommunity();
        } catch (err) {
            setError(err.response?.data?.error || 'Error updating community');
        }
    };

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    if (!community) {
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Alert severity="error">Community not found</Alert>
            </Container>
        );
    }

    const isAdmin = community.admins?.some(admin => admin._id === user?._id);
    const isMember = community.members?.some(member => member._id === user?._id);
    const isPending = community.pendingMembers?.some(member => member._id === user?._id);

    return (
        <Box sx={{ display: 'flex' }}>
            <Drawer
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                    },
                }}
                variant="persistent"
                anchor="left"
                open={open}
            >
                <List sx={{ mt: 8 }}>
                    <ListItem>
                        <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            startIcon={<AddIcon />}
                            onClick={() => setCreateDialogOpen(true)}
                        >
                            Create Community
                        </Button>
                    </ListItem>

                    <ListItem sx={{ mt: 2 }}>
                        <Typography variant="subtitle1" color="textSecondary">
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
                        >
                            <ListItemIcon>
                                {community.isPrivate ? <LockIcon /> : <PublicIcon />}
                            </ListItemIcon>
                            <ListItemText 
                                primary={community.name}
                                secondary={`${community.memberCount} members`}
                            />
                        </ListItem>
                    ))}
                </List>
            </Drawer>

            <Main>
                <Box sx={{ mt: 8 }}>
                    <SearchContainer>
                        <SearchField
                            placeholder="Search communities..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={handleSearch}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </SearchContainer>
                    <Box>
                        {/* Banner */}
                        <Box
                            sx={{
                                height: 200,
                                width: '100%',
                                backgroundColor: '#1a1a1b',
                                backgroundImage: community?.bannerImage ? 
                                    `url(${getBannerUrl(community.bannerImage)})` : 
                                    'none',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat',
                                borderRadius: 1,
                                mb: 2
                            }}
                        />

                        {/* Community Info */}
                        <Container maxWidth="lg">
                            <Paper
                                sx={{
                                    mt: -4,
                                    mb: 4,
                                    p: 3,
                                    backgroundColor: '#1a1a1b',
                                    color: 'white',
                                    position: 'relative'
                                }}
                            >
                                <Typography variant="h4" gutterBottom>
                                    b/{community.name}
                                </Typography>
                                <Typography variant="body1" color="rgba(255, 255, 255, 0.7)" paragraph>
                                    {community.description}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                    <Typography variant="body2" color="rgba(255, 255, 255, 0.7)">
                                        {community.memberCount} members
                                    </Typography>
                                    <Typography variant="body2" color="rgba(255, 255, 255, 0.7)">
                                        {community.isPrivate ? 'Private Community' : 'Public Community'}
                                    </Typography>
                                </Box>

                                {user && (
                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                        {!isMember && !isPending && (
                                            <Button
                                                variant="contained"
                                                onClick={handleJoinRequest}
                                                startIcon={<AddIcon />}
                                                sx={{
                                                    backgroundColor: '#2196f3',
                                                    '&:hover': {
                                                        backgroundColor: '#1565c0'
                                                    }
                                                }}
                                            >
                                                {community.isPrivate ? 'Request to Join' : 'Join'}
                                            </Button>
                                        )}
                                        {isPending && (
                                            <Button
                                                variant="contained"
                                                disabled
                                                sx={{ backgroundColor: 'rgba(255, 255, 255, 0.12)' }}
                                            >
                                                Request Pending
                                            </Button>
                                        )}
                                        {isAdmin && (
                                            <Button
                                                variant="outlined"
                                                onClick={() => setSettingsOpen(true)}
                                                startIcon={<SettingsIcon />}
                                                sx={{
                                                    borderColor: 'rgba(255, 255, 255, 0.23)',
                                                    color: 'white',
                                                    '&:hover': {
                                                        borderColor: '#90caf9'
                                                    }
                                                }}
                                            >
                                                Settings
                                            </Button>
                                        )}
                                    </Box>
                                )}
                            </Paper>

                            {/* Post Creation and Sorting */}
                            {isMember && (
                                <Box sx={{ mb: 3 }}>
                                    <Button
                                        variant="contained"
                                        fullWidth
                                        onClick={() => setCreatePostOpen(true)}
                                        sx={{
                                            mb: 2,
                                            backgroundColor: '#2196f3',
                                            '&:hover': {
                                                backgroundColor: '#1565c0'
                                            }
                                        }}
                                    >
                                        Create Post
                                    </Button>
                                    <ToggleButtonGroup
                                        value={sortBy}
                                        exclusive
                                        onChange={(e, newValue) => newValue && setSortBy(newValue)}
                                        sx={{
                                            '& .MuiToggleButton-root': {
                                                color: 'white',
                                                borderColor: 'rgba(255, 255, 255, 0.23)',
                                                '&.Mui-selected': {
                                                    backgroundColor: 'rgba(144, 202, 249, 0.08)',
                                                    color: '#90caf9'
                                                }
                                            }
                                        }}
                                    >
                                        <ToggleButton value="new">New</ToggleButton>
                                        <ToggleButton value="top">Top</ToggleButton>
                                    </ToggleButtonGroup>
                                </Box>
                            )}

                            {/* Posts */}
                            <PostList posts={posts} />
                        </Container>
                    </Box>
                </Box>
            </Main>

            {/* Create Post Dialog */}
            <CreatePost
                open={createPostOpen}
                onClose={() => setCreatePostOpen(false)}
                communityName={name}
                onPostCreated={fetchPosts}
            />

            {/* Settings Dialog */}
            <Dialog
                open={settingsOpen}
                onClose={() => setSettingsOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        backgroundColor: '#1a1a1b',
                        color: 'white'
                    }
                }}
            >
                <DialogTitle>Community Settings</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Description"
                        multiline
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        margin="normal"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                    borderColor: 'rgba(255, 255, 255, 0.23)'
                                },
                                '&:hover fieldset': {
                                    borderColor: 'rgba(255, 255, 255, 0.23)'
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: '#90caf9'
                                }
                            },
                            '& .MuiInputLabel-root': {
                                color: 'rgba(255, 255, 255, 0.7)'
                            },
                            '& .MuiInputBase-input': {
                                color: 'white'
                            }
                        }}
                    />
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setBannerImage(e.target.files[0])}
                        style={{ display: 'none' }}
                        id="banner-upload"
                    />
                    <label htmlFor="banner-upload">
                        <Button
                            component="span"
                            variant="outlined"
                            sx={{
                                mt: 2,
                                borderColor: 'rgba(255, 255, 255, 0.23)',
                                color: 'white',
                                '&:hover': {
                                    borderColor: '#90caf9'
                                }
                            }}
                        >
                            Upload New Banner
                        </Button>
                    </label>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setSettingsOpen(false)}
                        sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleUpdateCommunity}
                        variant="contained"
                        sx={{
                            backgroundColor: '#2196f3',
                            '&:hover': {
                                backgroundColor: '#1565c0'
                            }
                        }}
                    >
                        Save Changes
                    </Button>
                </DialogActions>
            </Dialog>

            <CreateCommunity
                open={createDialogOpen}
                onClose={() => setCreateDialogOpen(false)}
                onCommunityCreated={fetchUserCommunities}
            />
        </Box>
    );
};

export default Community;
