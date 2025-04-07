// src/pages/TeamsWithProposalPage/TeamsWithProposalPage.js
import React from 'react';
import useTeamsWithProposals from '../../hooks/useTeamsWithProposals';
import TeamProposalCard from '../../components/TeamProposalCard';
import PageHeader from '../../components/PageHeader';
import './TeamsWithProposalPage.css';

const TeamsWithProposalPage = () => {
  const {
    teamsWithProposals,
    isLoading,
    navigate,
  } = useTeamsWithProposals();

  const headerActions = (
    <button onClick={() => navigate('/')} className="secondary-button">
      ← Back to Home
    </button>
  );

  return (
    <div className="room-page">
      <PageHeader
       title="Research Teams with Proposals"
       subtitle={`${teamsWithProposals.length} ${teamsWithProposals.length === 1 ? 'team' : 'teams'} with proposals`}
       actions={headerActions}
      />

      <div className="content-container">
        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading teams...</p>
          </div>
        ) : teamsWithProposals.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <span role="img" aria-label="Research">👥</span>
            </div>
            <h3>No Teams Available</h3>
            <p>Generate teams and proposals to view them here</p>
            <button
              onClick={() => navigate(-1)}
              className="primary-button"
            >
              Go Back
            </button>
          </div>
        ) : (
          <div className="teams-proposals-list">
            {teamsWithProposals.map((team) => (
              <TeamProposalCard key={team.team_id} team={team} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamsWithProposalPage;