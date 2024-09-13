import React, { useState } from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, Typography, IconButton, Box } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import DashboardIcon from '@mui/icons-material/Dashboard';
import HelpIcon from '@mui/icons-material/Help';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import WorkIcon from '@mui/icons-material/Work'; // New icon for Jobs
import PlayArrowIcon from '@mui/icons-material/PlayArrow'; // New icon for Running
import CheckCircleIcon from '@mui/icons-material/CheckCircle'; // New icon for Completed
import FolderIcon from '@mui/icons-material/Folder';
import DeviceHubIcon from '@mui/icons-material/DeviceHub';
import { Link } from 'react-router-dom'; // Import Link
import MenuIcon from '@mui/icons-material/Menu'; // Icon for toggling sidebar
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'; // Icon for hiding sidebar

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(true); // State to manage sidebar visibility

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    const menuItems = [
        { text: 'Home', icon: <HomeIcon />, link: '/' },
        { text: 'My Work', icon: <CheckBoxIcon />, link: '/my-work' },
        { text: 'Dashboards', icon: <DashboardIcon />, link: '/dashboards' },
        { text: 'Help', icon: <HelpIcon />, link: '/help' },
        { text: 'Requests', icon: <CalendarTodayIcon />, link: '/requests' },
        { text: 'Jobs', icon: <WorkIcon />, link: '/jobs' },
        { text: 'Running', icon: <PlayArrowIcon />, link: '/jobs/running' },
        { text: 'Completed', icon: <CheckCircleIcon />, link: '/jobs/completed' },
        { text: 'Portfolios', icon: <FolderIcon />, link: '/portfolios' },
        { text: 'Programs', icon: <DeviceHubIcon />, link: '/programs' }
    ];

    return (
        <>
            <Drawer
                variant="persistent"
                open={isOpen}
                sx={{
                    width: isOpen ? 240 : 0,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: {
                        width: isOpen ? 240 : 0,
                        boxSizing: 'border-box',
                        background: 'linear-gradient(135deg, #0076CE, #005A99)', // New gradient background
                        color: '#ffffff', // Text color remains white
                        transition: 'width 0.3s',
                        boxShadow: '2px 0px 5px rgba(0,0,0,0.2)', // Shadow for depth
                    },
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
                    <IconButton onClick={toggleSidebar} sx={{ color: '#ffffff' }}>
                        {isOpen ? <ChevronLeftIcon /> : <MenuIcon />}
                    </IconButton>
                </Box>
                <Divider sx={{ backgroundColor: '#ffffff' }} />
                <List>
                    <Typography variant="h6" sx={{ padding: '10px 16px', color: '#ffffff' }}>Main</Typography>
                    {menuItems.slice(0, 4).map((item, index) => (
                        <ListItem 
                            button 
                            key={index} 
                            component={Link} 
                            to={item.link} 
                            aria-label={item.text}
                            sx={{
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                },
                            }}
                        >
                            <ListItemIcon sx={{ color: '#ffffff' }}>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItem>
                    ))}
                </List>
                <Divider sx={{ backgroundColor: '#ffffff' }} />
                <List>
                    <Typography variant="h6" sx={{ padding: '10px 16px', color: '#ffffff' }}>Requests</Typography>
                    {menuItems.slice(4, 5).map((item, index) => (
                        <ListItem 
                            button 
                            key={index} 
                            component={Link} 
                            to={item.link} 
                            aria-label={item.text}
                            sx={{
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                },
                            }}
                        >
                            <ListItemIcon sx={{ color: '#ffffff' }}>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItem>
                    ))}
                </List>
                <Divider sx={{ backgroundColor: '#ffffff' }} />
                <List>
                    <Typography variant="h6" sx={{ padding: '10px 16px', color: '#ffffff' }}>Jobs</Typography>
                    {menuItems.slice(5, 8).map((item, index) => (
                        <ListItem 
                            button 
                            key={index} 
                            component={Link} 
                            to={item.link} 
                            aria-label={item.text}
                            sx={{
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                },
                            }}
                        >
                            <ListItemIcon sx={{ color: '#ffffff' }}>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItem>
                    ))}
                </List>
                <Divider sx={{ backgroundColor: '#ffffff' }} />
                <List>
                    <Typography variant="h6" sx={{ padding: '10px 16px', color: '#ffffff' }}>Portfolios</Typography>
                    {menuItems.slice(8).map((item, index) => (
                        <ListItem 
                            button 
                            key={index} 
                            component={Link} 
                            to={item.link} 
                            aria-label={item.text}
                            sx={{
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                },
                            }}
                        >
                            <ListItemIcon sx={{ color: '#ffffff' }}>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItem>
                    ))}
                </List>
            </Drawer>
            {!isOpen && (
                <IconButton
                    onClick={toggleSidebar}
                    sx={{
                        position: 'absolute',
                        top: '20px',
                        left: '20px',
                        backgroundColor: '#0076CE',
                        color: '#ffffff',
                        boxShadow: '0px 0px 5px rgba(0,0,0,0.3)',
                        '&:hover': {
                            backgroundColor: '#005A99',
                        },
                    }}
                >
                    <MenuIcon />
                </IconButton>
            )}
        </>
    );
}

export default Sidebar;
