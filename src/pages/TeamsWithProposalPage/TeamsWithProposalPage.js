import React from 'react';
import { useNavigate } from 'react-router-dom';
import useProfileStore from '../../store/profileStore';
import TeamWithProposalsCard from '../../components/TeamWithProposalsCard';
import './TeamsWithProposalPage.css';

const TeamsWithProposalPage = () => {
  const navigate = useNavigate();
  const { teamsWithProposals } = useProfileStore();

  return (
    <div className="teams-with-proposals-page">
      <div className="header-container">
        <h1>Research Teams with Project Proposals</h1>
        <button onClick={() => navigate('/')} className="back-button">
          ← Back to Home
        </button>
      </div>

      {teamsWithProposals.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🧑🔬</div>
          <p>No teams data available. Please generate teams first.</p>
        </div>
      ) : (
        <div className="teams-container">
          {teamsWithProposals.map((team) => (
            <TeamWithProposalsCard key={team.team_id} team={team} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamsWithProposalPage;