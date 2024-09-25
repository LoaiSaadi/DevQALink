import React, { useState } from 'react';
import { AppBar, Tabs, Tab, Box } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import QaIcon from '@mui/icons-material/DeviceHub'; // New icon for Jobs
import ManagementIcon from '@mui/icons-material/Dashboard';
import BuildIcon from '@mui/icons-material/Build';
import JobsIcon from '@mui/icons-material/Work'; // New icon for Jobs
import ReportsIcon from '@mui/icons-material/CheckCircle'; // New icon for Completed
import { Link } from 'react-router-dom'; // Import Link

const TopTabs = () => {
    const [value, setValue] = useState(0); // State to manage selected tab

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const menuItems = [
        { text: 'Home', icon: <HomeIcon />, link: '/' },
        { text: 'QA Testers', icon: <QaIcon />, link: '/qa' },
        { text: 'Dev Builds', icon: <BuildIcon />, link: '/builds' },
        { text: 'Resources', icon: <ManagementIcon />, link: '/resources' },
        { text: 'Jobs', icon: <JobsIcon />, link: '/jobs' },
        { text: 'Reports', icon: <ReportsIcon />, link: '/reports' },
    ];

    return (
        <AppBar position="static" sx={{ background: 'linear-gradient(135deg, #0076CE, #005A99)', color: '#ffffff', boxShadow: '0px 2px 5px rgba(0,0,0,0.2)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Tabs 
                    value={value} 
                    onChange={handleChange} 
                    aria-label="navigation tabs" 
                    sx={{ color: '#ffffff', flexWrap: 'wrap' }}
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
                            sx={{ color: '#ffffff' }}
                        />
                    ))}
                </Tabs>
            </Box>
        </AppBar>
    );
}

export default TopTabs;


