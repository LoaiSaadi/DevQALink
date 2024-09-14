
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TopTabs from './components/TopTabs'; // Import the TopTabs component
import Home from './pages/Home';
import Management from './pages/Management/Management'; // Points to the Management component
import Jobs from './pages/Jobs/Jobs'; // Points to the Jobs component
import Reports from './pages/Reports'; // Reports  page
import QA from './pages/Qa/Qa'; // Points to the QA component


const App = () => {
    return (
        <Router>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <TopTabs />
                <div style={{ padding: '20px', flexGrow: 1 }}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/qa" element={<QA />} />
                        <Route path="/management" element={<Management />} />
                        <Route path="/jobs" element={<Jobs />} /> {/* Route for Jobs */}
                        <Route path="/reports" element={<Reports />} /> {/* Route for Reports */}
                    </Routes>
                </div>
            </div>
        </Router>
    );
}

export default App;

