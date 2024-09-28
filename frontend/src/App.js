import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TopTabs from './components/TopTabs';
import Home from './pages/Home/Home';
import Build from './pages/Build/Build';
import Management from './pages/Management/Management';
import Jobs from './pages/Jobs/Jobs';
import Reports from './pages/Reports/Reports';
import QA from './pages/Qa/Qa';
import Auth from './pages/Auth/Auth';  // Login page
import Landing from './pages/Landing/Landing';  // Import the Landing page

const App = () => {
    return (
        <Router>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <TopTabs />
                <div style={{ padding: '20px', flexGrow: 1 }}>
                    <Routes>
                        <Route path="/" element={<Landing />} /> {/* Landing page is the main page */}
                        <Route path="/login" element={<Auth />} />  {/* Login page */}
                        <Route path="/home" element={<Home />} />
                        <Route path="/qa" element={<QA />} />
                        <Route path="/builds" element={<Build />} />
                        <Route path="/resources" element={<Management />} />
                        <Route path="/jobs" element={<Jobs />} />
                        <Route path="/reports" element={<Reports />} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
}

export default App;
