import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Switch,
  FormControlLabel,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Alert,
  Tab,
  Tabs,
  TextField,
  Snackbar,
  Tooltip,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  PersonAdd as PersonAddIcon,
  PersonRemove as PersonRemoveIcon,
  RemoveCircle as RemoveCircleIcon,
} from '@mui/icons-material';
import axios from '../../utils/axios';

const CommunitySettings = ({ community, onUpdate, onClose }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [isPrivate, setIsPrivate] = useState(community.isPrivate);
  const [description, setDescription] = useState(community.description);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'error',
  });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handlePrivacyChange = async () => {
    try {
      await axios.put(`/api/b/${community.name}`, {
        isPrivate: !isPrivate,
        description: description
      });
      setIsPrivate(!isPrivate);
      onUpdate();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update community settings');
    }
  };

  const handleDescriptionUpdate = async () => {
    try {
      await axios.put(`/api/b/${community.name}`, {
        isPrivate: isPrivate,
        description: description
      });
      setIsEditing(false);
      onUpdate();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update community description');
    }
  };

  const handleDeleteCommunity = async () => {
    try {
      await axios.delete(`/api/b/${community.name}`);
      onClose();
      window.location.href = '/'; // Redirect to home page
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete community');
    }
  };

  const handleApproveJoinRequest = async (userId) => {
    try {
      await axios.post(`/api/b/${community.name}/approve`, { userId });
      onUpdate();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to approve join request');
    }
  };

  const handleRejectJoinRequest = async (userId) => {
    try {
      await axios.post(`/api/b/${community.name}/reject`, { userId });
      onUpdate();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reject join request');
    }
  };

  const handleRemoveMember = async (userId) => {
    try {
      await axios.post(`/api/b/${community.name}/remove-member`, { userId });
      onUpdate();
      setSnackbar({
        open: true,
        message: 'Member removed successfully',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Failed to remove member',
        severity: 'error'
      });
    }
  };

  const handleAddAdmin = async (userId) => {
    try {
      await axios.post(`/api/b/${community.name}/admin`, { userId });
      onUpdate();
      setSnackbar({
        open: true,
        message: 'Admin added successfully',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Failed to add admin',
        severity: 'error'
      });
    }
  };

  const handleRemoveAdmin = async (userId) => {
    try {
      await axios.post(`/api/b/${community.name}/remove-admin`, { userId });
      onUpdate();
      setSnackbar({
        open: true,
        message: 'Admin removed successfully',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Failed to remove admin',
        severity: 'error'
      });
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto', mt: 3 }}>
      <Typography variant="h5" gutterBottom>
        Community Settings
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="General" />
        <Tab label="Members" />
        <Tab label="Join Requests" />
        <Tab label="Danger Zone" />
      </Tabs>

      {activeTab === 0 && (
        <Box>
          <FormControlLabel
            control={
              <Switch
                checked={isPrivate}
                onChange={handlePrivacyChange}
                color="primary"
              />
            }
            label={`Community is ${isPrivate ? 'Private' : 'Public'}`}
          />
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Community Description
              <IconButton size="small" onClick={() => setIsEditing(!isEditing)} sx={{ ml: 1 }}>
                <EditIcon />
              </IconButton>
            </Typography>
            {isEditing ? (
              <Box sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                  <Button variant="contained" onClick={handleDescriptionUpdate}>
                    Save
                  </Button>
                  <Button onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </Box>
              </Box>
            ) : (
              <Typography>{description}</Typography>
            )}
          </Box>
        </Box>
      )}

      {activeTab === 1 && (
        <List>
          {community.members.map((member) => (
            <ListItem key={member._id}>
              <ListItemText
                primary={member.username}
                secondary={
                  community.owner._id === member._id
                    ? 'Owner'
                    : community.admins.some(admin => admin._id === member._id)
                    ? 'Admin'
                    : 'Member'
                }
              />
              <ListItemSecondaryAction>
                {community.owner._id !== member._id && (
                  <>
                    {community.admins.some(admin => admin._id === member._id) ? (
                      <Tooltip title="Remove Admin">
                        <IconButton
                          edge="end"
                          onClick={() => handleRemoveAdmin(member._id)}
                          color="warning"
                          sx={{ mr: 1 }}
                        >
                          <RemoveCircleIcon />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Add Admin">
                        <IconButton
                          edge="end"
                          onClick={() => handleAddAdmin(member._id)}
                          color="primary"
                          sx={{ mr: 1 }}
                        >
                          <PersonAddIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Remove Member">
                      <IconButton
                        edge="end"
                        onClick={() => handleRemoveMember(member._id)}
                        color="error"
                      >
                        <PersonRemoveIcon />
                      </IconButton>
                    </Tooltip>
                  </>
                )}
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}

      {activeTab === 2 && (
        <List>
          {community.pendingMembers?.map((member) => (
            <ListItem key={member._id}>
              <ListItemText primary={member.username} />
              <ListItemSecondaryAction>
                <Tooltip title="Approve Join Request">
                  <IconButton
                    edge="end"
                    onClick={() => handleApproveJoinRequest(member._id)}
                    color="success"
                    sx={{ mr: 1 }}
                  >
                    <CheckIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Reject Join Request">
                  <IconButton
                    edge="end"
                    onClick={() => handleRejectJoinRequest(member._id)}
                    color="error"
                  >
                    <CloseIcon />
                  </IconButton>
                </Tooltip>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}

      {activeTab === 3 && (
        <Box>
          <Typography variant="h6" color="error" gutterBottom>
            Danger Zone
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => setDeleteDialogOpen(true)}
          >
            Delete Community
          </Button>
          <Dialog
            open={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen(false)}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: {
                backgroundColor: '#1a1a1b',
                color: 'white'
              }
            }}
          >
            <DialogTitle>Delete Community</DialogTitle>
            <DialogContent>
              <Typography>
                Are you sure you want to delete this community? This action cannot be undone.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
                Cancel
              </Button>
              <Button onClick={handleDeleteCommunity} color="error">
                Delete
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default CommunitySettings;
