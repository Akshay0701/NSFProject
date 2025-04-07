import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProfilesPage from './pages/ProfilePage';
import TeamPage from './pages/TeamPage';
import TeamsWithProposalPage from './pages/TeamsWithProposalPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/profiles" element={<ProfilesPage />} />
        <Route path="/teams" element={<TeamPage />} />
        <Route path="/teamswithproposal" element={<TeamsWithProposalPage />} />
      </Routes>
    </Router>
  );
}

export default App;