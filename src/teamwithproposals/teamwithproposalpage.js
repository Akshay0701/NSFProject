import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './TeamsWithProposalPage.css';

const TeamsWithProposalPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const teams = location.state?.teams || [];
  const [expandedTeams, setExpandedTeams] = useState({});

  const toggleProposals = (teamId) => {
    setExpandedTeams(prev => ({
      ...prev,
      [teamId]: !prev[teamId]
    }));
  };

  return (
    <div className="teams-with-proposals-page">
      <div className="header-container">
        <h1>Research Teams with Project Proposals</h1>
        <button onClick={() => navigate('/')} className="back-button">
          ← Back to Home
        </button>
      </div>

      {teams.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🧑🔬</div>
          <p>No teams data available. Please generate teams first.</p>
        </div>
      ) : (
        <div className="teams-container">
          {teams.map((team) => (
            <div key={team.team_id} className="team-card">
              <div className="card-header">
                <div className="team-meta">
                  <h2>Team #{team.team_id}</h2>
                  <span className="team-size">{team.team_size} members</span>
                </div>
                <button 
                  onClick={() => toggleProposals(team.team_id)}
                  className="toggle-proposals-btn"
                >
                  {expandedTeams[team.team_id] ? 'Hide Proposals' : 'Show Proposals'}
                  <span className={`chevron ${expandedTeams[team.team_id] ? 'expanded' : ''}`}>
                    ▼
                  </span>
                </button>
              </div>

              <div className="team-content">
                <div className="team-section">
                  <h3 className="section-title">Research Focus</h3>
                  <div className="tags-container">
                    {team.team_research_areas.map((area, idx) => (
                      <span key={idx} className="research-tag">
                        {area}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="team-section">
                  <h3 className="section-title">Members</h3>
                  <div className="members-grid">
                    {team.members.map((member) => (
                      <div key={member} className="member-card">
                        <div className="member-name">{member}</div>
                        <div className="member-fields">
                          {team.member_fields[member].map((field, idx) => (
                            <span key={idx} className="field-tag">
                              {field}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {expandedTeams[team.team_id] && (
                  <div className="team-section">
                    <h3 className="section-title">Project Proposals</h3>
                    <div className="proposals-container">
                      {team.project_proposals?.length > 0 ? (
                        team.project_proposals.map((proposal, idx) => (
                          <div key={idx} className="proposal-card">
                            <div className="proposal-header">
                              <span className="proposal-number">Proposal #{idx + 1}</span>
                            </div>
                            <p className="proposal-text">{proposal}</p>
                          </div>
                        ))
                      ) : (
                        <div className="no-proposals">
                          No proposals generated yet
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamsWithProposalPage;