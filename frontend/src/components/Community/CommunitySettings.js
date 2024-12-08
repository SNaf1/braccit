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
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  PersonAdd as PersonAddIcon,
  PersonRemove as PersonRemoveIcon,
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
                secondary={community.admins.some(admin => admin._id === member._id) ? 'Admin' : 'Member'}
              />
              {!community.admins.some(admin => admin._id === member._id) && (
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => handleRemoveMember(member._id)}
                    color="error"
                  >
                    <PersonRemoveIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              )}
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
                <IconButton
                  edge="end"
                  onClick={() => handleApproveJoinRequest(member._id)}
                  color="success"
                  sx={{ mr: 1 }}
                >
                  <CheckIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  onClick={() => handleRejectJoinRequest(member._id)}
                  color="error"
                >
                  <CloseIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
          {(!community.pendingMembers || community.pendingMembers.length === 0) && (
            <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
              No pending join requests
            </Typography>
          )}
        </List>
      )}

      {activeTab === 3 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" color="error" gutterBottom>
            Delete Community
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Once you delete a community, there is no going back. Please be certain.
          </Typography>
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => setDeleteDialogOpen(true)}
          >
            Delete Community
          </Button>
        </Box>
      )}

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Community?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this community? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteCommunity} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        severity={snackbar.severity}
      />
    </Paper>
  );
};

export default CommunitySettings;
