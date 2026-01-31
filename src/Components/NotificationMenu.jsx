import React, { useState } from "react";
import { IconButton, Menu, MenuItem, Badge, ListItemText } from "@mui/material";
import { IoNotifications } from "react-icons/io5";

const NotificationMenu = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // Example notifications
  const notifications = [
    { id: 1, text: "New message from Admin" },
    { id: 2, text: "System update scheduled" },
    { id: 3, text: "Your report is ready" },
  ];

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton onClick={handleOpen} sx={{ p: 0 }}>
        <Badge badgeContent={notifications.length} color="error">
          <IoNotifications style={{ color: "#fcd80a", fontSize: "1.5rem" }} />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        {notifications.length > 0 ? (
          notifications.map((note) => (
            <MenuItem key={note.id} onClick={handleClose}>
              <ListItemText primary={note.text} />
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled>No new notifications</MenuItem>
        )}
      </Menu>
    </>
  );
};

export default NotificationMenu;
