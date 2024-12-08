import React, { useState } from 'react';
import {
    Box,
    Avatar,
    Menu,
    MenuItem,
    ListItemIcon,
    Divider,
    IconButton,
    Typography
} from '@mui/material';
import {
    Person as PersonIcon,
    Settings as SettingsIcon,
    ExitToApp as LogoutIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const UserDropdown = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleProfile = () => {
        navigate(`/user/${user.username}`);
        handleClose();
    };

    const handleSettings = () => {
        navigate('/settings');
        handleClose();
    };

    const handleLogout = () => {
        logout();
        handleClose();
        navigate('/');
    };

    return (
        <>
            <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>
                <IconButton
                    onClick={handleClick}
                    size="small"
                    sx={{ ml: 2 }}
                    aria-controls={open ? 'account-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                >
                    <Avatar
                        sx={{
                            width: 32,
                            height: 32,
                            backgroundColor: '#2196f3',
                            '&:hover': { opacity: 0.8 }
                        }}
                        src={user?.profilePicture}
                    >
                        {user?.username?.[0]?.toUpperCase()}
                    </Avatar>
                </IconButton>
            </Box>
            <Menu
                anchorEl={anchorEl}
                id="account-menu"
                open={open}
                onClose={handleClose}
                PaperProps={{
                    sx: {
                        backgroundColor: '#1a1a1b',
                        color: 'white',
                        mt: 1.5,
                        '& .MuiMenuItem-root': {
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.1)'
                            }
                        }
                    }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <Box sx={{ px: 2, py: 1 }}>
                    <Typography variant="subtitle1" color="#2196f3">
                        {user?.username}
                    </Typography>
                </Box>
                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)' }} />
                <MenuItem onClick={handleProfile}>
                    <ListItemIcon>
                        <PersonIcon sx={{ color: 'white' }} />
                    </ListItemIcon>
                    Profile
                </MenuItem>
                <MenuItem onClick={handleSettings}>
                    <ListItemIcon>
                        <SettingsIcon sx={{ color: 'white' }} />
                    </ListItemIcon>
                    Settings
                </MenuItem>
                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)' }} />
                <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                        <LogoutIcon sx={{ color: 'white' }} />
                    </ListItemIcon>
                    Logout
                </MenuItem>
            </Menu>
        </>
    );
};

export default UserDropdown;
