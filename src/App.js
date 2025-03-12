import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './homepage/HomePage';
import ProfilesPage from './profilepage/ProfilePage';
import TeamPage from './teampage/TeamPage';
import TeamsWithProposalPage from './teamwithproposals/teamwithproposalpage';

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