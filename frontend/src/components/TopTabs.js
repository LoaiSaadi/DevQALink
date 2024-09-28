import React, { useState } from 'react';
import { AppBar, Tabs, Tab, Box } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import QaIcon from '@mui/icons-material/DeviceHub';
import ManagementIcon from '@mui/icons-material/Dashboard';
import BuildIcon from '@mui/icons-material/Build';
import JobsIcon from '@mui/icons-material/Work';
import ReportsIcon from '@mui/icons-material/CheckCircle';
import { Link } from 'react-router-dom';

import dellLogo from './Dell_Logo.png'; // Adjust the path as necessary

const TopTabs = () => {
    const [value, setValue] = useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const menuItems = [
        { text: 'Home', icon: <HomeIcon />, link: '/home' },
        { text: 'QA Tests', icon: <QaIcon />, link: '/qa' },
        { text: 'Dev Builds', icon: <BuildIcon />, link: '/builds' },
        { text: 'Resources', icon: <ManagementIcon />, link: '/resources' },
        { text: 'Jobs', icon: <JobsIcon />, link: '/jobs' },
        { text: 'Reports', icon: <ReportsIcon />, link: '/reports' },
    ];

    return (
        <AppBar position="static" sx={{ backgroundColor: '#CCD3DC', color: '#000000', boxShadow: 'none' }}> {/* Darker gray */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px' }}>
                {/* Logo on the left */}
                <Box component="img" src={dellLogo} alt="Dell Logo" sx={{ width: '140px', height: '35px' }} />
                
                {/* Tabs in the center */}
                <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
                    <Tabs 
                        value={value} 
                        onChange={handleChange} 
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
                                    color: value === index ? '#000000' : '#888888', // Dark gray for unselected tabs
                                    backgroundColor: value === index ? '#E0E0E0' : 'transparent', // Light gray for selected tab
                                    '&:hover': {
                                        backgroundColor: '#C0C0C0', // Darker gray on hover
                                    },
                                    borderRadius: '8px', // Rounded corners for a softer look
                                    margin: '0 5px', // Spacing between tabs
                                }}
                            />
                        ))}
                    </Tabs>
                </Box>
            </Box>
        </AppBar>
    );
}

export default TopTabs;
