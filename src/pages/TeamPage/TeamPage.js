// src/pages/TeamPage/TeamPage.js
import React from 'react';
import useTeamPage from '../../hooks/useTeamPage';
import './TeamPage.css';
import PageHeader from '../../components/PageHeader';
import TeamCard from '../../components/TeamCard';

const TeamPage = () => {
  const {
    roomId,
    teams,
    loading,
    isGeneratingProposals,
    navigate,
    handleGenerateProposals
  } = useTeamPage();

  const headerActions = (
    <button onClick={() => navigate('/')} className="secondary-button">
      ← Back to Home
    </button>
  );

  return (
    <div className="room-page">
      <PageHeader
        title="Research Teams"
        subtitle={`${teams.length} ${teams.length === 1 ? 'team' : 'teams'} formed`}
        actions={headerActions}
      />

      <div className="content-container">
        {loading ? (
          <div className="loading-rooms">
            <div className="spinner"></div>
            <p>Loading teams...</p>
          </div>
        ) : teams.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <span role="img" aria-label="Team">👥</span>
            </div>
            <h3>No Teams Available</h3>
            <p>Generate teams from researcher profiles to get started</p>
            <button onClick={() => navigate(`/room/${roomId}/profiles`)} className="primary-button">
              View Profiles
            </button>
          </div>
        ) : (
          <>
            <div className="profile-grid">
              {teams.map((team) => (
                <TeamCard key={team.team_id} team={team} />
              ))}
            </div>

            <div className="generate-teams-container">
              <button
                className="generate-teams-btn"
                onClick={handleGenerateProposals}
                disabled={isGeneratingProposals || teams.length === 0}
              >
                {isGeneratingProposals ? 'Generating Proposals...' : 'Generate Research Proposals'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TeamPage;
