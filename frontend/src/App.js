import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import TopTabs from './navigationBar/TopTabs';
import Home from './pages/Home/Home';
import Build from './pages/Build/Build';
import Management from './pages/Management/Management';
import Jobs from './pages/Jobs/Jobs';
import Reports from './pages/Reports/Reports';
import QA from './pages/Qa/Qa';
import Auth from './pages/Auth/Auth';  // Login page
import Register from './pages/Auth/Register';  // Register page
import Landing from './pages/Landing/Landing';  // Landing page

// A wrapper to conditionally render TopTabs based on the current path
const AppWrapper = () => {
    const location = useLocation();

    // Define paths where TopTabs should be hidden
    const hideTopTabs = ["/", "/login", "/register"];

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Conditionally render TopTabs only if the current path is not in hideTopTabs */}
            {!hideTopTabs.includes(location.pathname) && <TopTabs />}
            <div style={{ padding: '20px', flexGrow: 1 }}>
                <Routes>
                    <Route path="/" element={<Landing />} /> {/* Landing page */}
                    <Route path="/login" element={<Auth />} /> {/* Login page */}
                    <Route path="/register" element={<Register />} /> {/* Register page */}
                    <Route path="/home" element={<Home />} /> {/* Home page */}
                    <Route path="/qa" element={<QA />} />
                    <Route path="/builds" element={<Build />} />
                    <Route path="/resources" element={<Management />} />
                    <Route path="/jobs" element={<Jobs />} />
                    <Route path="/reports" element={<Reports />} />
                </Routes>
            </div>
        </div>
    );
}

const App = () => {
    return (
        <Router>
            <AppWrapper />
        </Router>
    );
}

export default App;
