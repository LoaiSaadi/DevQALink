import React, { useState, useEffect } from 'react';
import { AppBar, Tabs, Tab, Box, Button } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import QaIcon from '@mui/icons-material/DeviceHub';
import ManagementIcon from '@mui/icons-material/Dashboard';
import BuildIcon from '@mui/icons-material/Build';
import JobsIcon from '@mui/icons-material/Work';
import ReportsIcon from '@mui/icons-material/CheckCircle';
import LogoutIcon from '@mui/icons-material/Logout'; // Import the LogoutIcon
import { Link, useNavigate, useLocation } from 'react-router-dom';

import dellLogo from './Dell_Logo.png';

const TopTabs = () => {
    const [username, setUsername] = useState(null); // State to store the username
    const navigate = useNavigate(); // Hook for programmatic navigation
    const location = useLocation(); // Hook to get the current route

    // Retrieve the username from localStorage when the component mounts
    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) {
            setUsername(storedUsername);
        }
    }, []);

    // Automatically set the tab value based on the current route
    const menuItems = [
        { text: 'Home', icon: <HomeIcon />, link: '/home' },
        { text: 'QA Tests', icon: <QaIcon />, link: '/qa' },
        { text: 'Dev Builds', icon: <BuildIcon />, link: '/builds' },
        { text: 'Resources', icon: <ManagementIcon />, link: '/resources' },
        { text: 'Jobs', icon: <JobsIcon />, link: '/jobs' },
        { text: 'Reports', icon: <ReportsIcon />, link: '/reports' },
    ];

    const currentPathIndex = menuItems.findIndex(item => item.link === location.pathname);

    const handleLogout = () => {
        // Perform any logout logic here (like clearing tokens if necessary)
        alert(`Goodbye, @${username}`); // Show a goodbye message
        localStorage.removeItem('username'); // Remove username from localStorage on logout
        localStorage.removeItem('token');
        navigate('/'); // Navigate to the landing page ("/")
    };

    return (
        <AppBar position="static" sx={{ backgroundColor: '#CCD3DC', color: '#000000', boxShadow: 'none' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px' }}>
                <a href="https://www.dell.com/" target="_blank" rel="noopener noreferrer">
                    <Box component="img" src={dellLogo} alt="Dell Logo" sx={{ width: '130px', height: '35px' }} />
                </a>

                {/* Tabs in the center */}
                <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
                    <Tabs
                        value={currentPathIndex}
                        aria-label="navigation tabs"
                        sx={{ color: '#000000', flexWrap: 'wrap' }}
                    >
                        {menuItems.map((item, index) => (
                            <Tab
                                key={index}
                                label={
                                    <>
                                        {item.icon}
                                        <Box sx={{ ml: 1 }}>{item.text}</Box>
                                    </>
                                }
                                component={Link}
                                to={item.link}
                                aria-label={item.text}
                                sx={{
                                    color: currentPathIndex === index ? '#000000' : '#888888',
                                    backgroundColor: currentPathIndex === index ? '#E0E0E0' : 'transparent',
                                    '&:hover': {
                                        backgroundColor: '#C0C0C0',
                                    },
                                    borderRadius: '8px',
                                    margin: '0 5px',
                                }}
                            />
                        ))}
                    </Tabs>
                </Box>

                {/* "Hi, @username" and Logout Button */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {username && <span style={{ fontSize: '1.1rem', color: '#000' }}>Hi, @{username}</span>}
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={handleLogout}
                        sx={{ backgroundColor: '#0066a1', '&:hover': { backgroundColor: '#888888' } }}
                    >
                        <LogoutIcon /> {/* Use the LogoutIcon here */}
                    </Button>
                </Box>
            </Box>
        </AppBar>
    );
}

export default TopTabs;
