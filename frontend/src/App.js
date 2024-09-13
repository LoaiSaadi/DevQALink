
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TopTabs from './components/TopTabs'; // Import the TopTabs component
import Home from './pages/Home';
import Management from './pages/Management'; // Points to the Management component
import Jobs from './pages/Jobs/Jobs'; // Points to the Jobs component
import Reports from './pages/Reports'; // Reports  page


const App = () => {
    return (
        <Router>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <TopTabs />
                <div style={{ padding: '20px', flexGrow: 1 }}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/management" element={<Management />} />
                        <Route path="/jobs" element={<Jobs />} /> {/* Route for Jobs */}
                        <Route path="/Reports" element={<Reports />} /> {/* Route for Reports */}
                    </Routes>
                </div>
            </div>
        </Router>
    );
}

export default App;

