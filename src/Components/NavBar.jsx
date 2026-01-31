import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  Menu,
  MenuItem,
  ListItemIcon,
  colors,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Settings from '@mui/icons-material/Settings';
import Lock from '@mui/icons-material/Lock';
import logo from '../skylark_logo.png';
import { CircleUserRound } from 'lucide-react';
import { FamilyRestroom } from '@mui/icons-material';
import { IoNotifications } from 'react-icons/io5';
import { MdAccountCircle } from 'react-icons/md';
import HelpIcon from '@mui/icons-material/Help';
import NotificationMenu from './NotificationMenu';

import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

const NavBar = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        overflow: 'hidden',
        background: 'linear-gradient( to right, #9333EA, #6B21A8)',

        height: '75px',
        padding: { xs: '5px 10px', sm: '10px 20px' },
      }}
    >
      <Toolbar
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          minHeight: '75px',
        }}
      >
        {/* Left - Logo */}
        <Box display="flex" alignItems="start">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'start',
              // bgcolor: "white",
              borderRadius: 1,
              p: 0.5,
            }}
          >
            <img src={logo} alt="Company Logo" style={{ height: '180px', maxWidth: '100%' }} />
            {/* <h2 style={{ fontFamily: "'ui-sans-serif', system-ui , sans-serif", fontWeight: '800' }}>
            SKYLARK
          </h2> */}
          </Box>
        </Box>

        {/* Right - Avatar Dropdown and Logout */}
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
            <MdAccountCircle style={{ color: 'white' }} />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            onClick={handleMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem component={Link} to="/profile">
              <ListItemIcon>
                <AccountCircle fontSize="small" style={{ color: '#9333EA' }} />
              </ListItemIcon>
              Profile
            </MenuItem>
            <MenuItem component={Link} to="/support">
              <ListItemIcon>
                <HelpIcon fontSize="small" style={{ color: '#2375e8' }} />
              </ListItemIcon>
              Help
            </MenuItem>
          </Menu>

          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
