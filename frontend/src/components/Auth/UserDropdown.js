import React, { useState, useEffect } from 'react';
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
        if (user?.username) {
            navigate(`/user/${user.username}`);
            handleClose();
        }
    };

    const handleSettings = () => {
        navigate('/settings');
        handleClose();
    };

    const handleLogout = async () => {
        await logout();
        handleClose();
        navigate('/');
    };

    // Only render if we have a user
    if (!user) return null;

    return (
        <>
            <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>
                <IconButton
                    onClick={handleClick}
                    size="small"
                    aria-controls={open ? 'account-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                >
                    <Avatar 
                        sx={{ width: 32, height: 32 }}
                        src={user.profilePicture}
                        alt={user.username}
                    >
                        {user.username?.[0]?.toUpperCase()}
                    </Avatar>
                </IconButton>
            </Box>
            <Menu
                anchorEl={anchorEl}
                id="account-menu"
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                PaperProps={{
                    elevation: 0,
                    sx: {
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                        mt: 1.5,
                        bgcolor: '#1a1a1b',
                        border: '1px solid #343536',
                        color: '#d7dadc',
                        '& .MuiMenuItem-root': {
                            color: '#d7dadc',
                            '&:hover': {
                                bgcolor: 'rgba(255, 255, 255, 0.1)'
                            }
                        }
                    }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <MenuItem onClick={handleProfile}>
                    <ListItemIcon>
                        <PersonIcon sx={{ color: '#d7dadc' }} />
                    </ListItemIcon>
                    Profile
                </MenuItem>
                <MenuItem onClick={handleSettings}>
                    <ListItemIcon>
                        <SettingsIcon sx={{ color: '#d7dadc' }} />
                    </ListItemIcon>
                    Settings
                </MenuItem>
                <Divider sx={{ borderColor: '#343536' }} />
                <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                        <LogoutIcon sx={{ color: '#d7dadc' }} />
                    </ListItemIcon>
                    Logout
                </MenuItem>
            </Menu>
        </>
    );
};

export default UserDropdown;
