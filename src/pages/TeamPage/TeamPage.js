import React from 'react';
import { useNavigate } from 'react-router-dom';
import useProfileStore from '../../store/profileStore';
import useGenerateProposals from '../../hooks/useGenerateProposals';
import './TeamPage.css';

const TeamPage = () => {
  const navigate = useNavigate();
  const { teams, isGeneratingProposals } = useProfileStore();
  const { generateProposals } = useGenerateProposals();

  return (
    <div className="team-page">
      <header className="page-header">
        <h1>Research Teams</h1>
        <div className="header-controls">
          <button onClick={() => navigate('/')} className="back-button">
            ← Back to Home
          </button>
          <button
            onClick={generateProposals}
            className={`generate-button ${isGeneratingProposals ? 'loading' : ''}`}
            disabled={isGeneratingProposals || teams.length === 0}
          >
            {isGeneratingProposals ? (
              <>
                <div className="spinner"></div>
                Generating...
              </>
            ) : (
              'Generate Proposals'
            )}
          </button>
        </div>
      </header>

      {teams.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🧑🔬</div>
          <p>No teams available. Please create teams first.</p>
        </div>
      ) : (
        <div className="teams-grid">
          {teams.map((team) => (
            <div key={team.team_id} className="team-card">
              <div className="card-header">
                <h2>Team #{team.team_id}</h2>
                <span className="team-size">
                  {team.team_size} member{team.team_size > 1 ? 's' : ''}
                </span>
              </div>

              <div className="card-section">
                <h3 className="section-title">Research Focus Areas</h3>
                <div className="tags-container">
                  {team.team_research_areas.map((area, idx) => (
                    <span key={idx} className="research-tag">{area}</span>
                  ))}
                </div>
              </div>

              <div className="card-section">
                <h3 className="section-title">Team Members</h3>
                <div className="members-list">
                  {team.members.map((member) => (
                    <div key={member} className="member-item">
                      <div className="member-name">{member}</div>
                      <div className="member-fields">
                        {team.member_fields[member].map((field, idx) => (
                          <span key={idx} className="field-tag">{field}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamPage;