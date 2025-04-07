// src/components/TeamProposalCard.js
import React, { useState } from 'react';
import './TeamProposalCard.css';

const TeamProposalCard = ({ team }) => {
  const [showAllProposals, setShowAllProposals] = useState(false);
  const initialProposalLimit = 2; // Show only 2 proposals initially
  const proposalsToShow = showAllProposals
    ? team.project_proposals
    : team.project_proposals?.slice(0, initialProposalLimit);

  return (
    <div className="proposal-team-wrapper">
      {/* Left Panel - Team Info */}
      <div className="proposal-team-details">
        <div className="proposal-team-title-bar">
          <h2>Team {team.team_id}</h2>
          <span className="proposal-team-size">
            {team.team_size} member{team.team_size !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="proposal-team-block">
          <h3 className="proposal-team-heading">
            <span className="proposal-team-icon">🔍</span> Research Focus
          </h3>
          <div className="proposal-team-tags">
            {team.team_research_areas.map((area, idx) => (
              <span key={idx} className="proposal-team-research-label">{area}</span>
            ))}
          </div>
        </div>

        <div className="proposal-team-block">
          <h3 className="proposal-team-heading">
            <span className="proposal-team-icon">👥</span> Members
          </h3>
          <div className="proposal-team-members">
            {team.members.map((member) => (
              <div key={member} className="proposal-team-member">
                <div className="proposal-team-member-name">{member}</div>
                <div className="proposal-team-member-skills">
                  {team.member_fields[member].slice(0, 5).map((field, idx) => (
                    <span key={idx} className="proposal-team-skill-label">{field}</span>
                  ))}
                  {team.member_fields[member].length > 5 && (
                    <span className="proposal-team-skill-label">
                      +{team.member_fields[member].length - 5} more
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Proposals */}
      <div className="proposal-team-projects">
        <div className="proposal-team-projects-title">
          <h3>
            <span className="proposal-team-icon">📑</span> Project Proposals
          </h3>
          <span className="proposal-team-projects-count">
            {team.project_proposals?.length || 0} proposal{team.project_proposals?.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="proposal-team-projects-list">
          {team.project_proposals?.length > 0 ? (
            <>
              {proposalsToShow.map((proposal, idx) => (
                <div key={idx} className="proposal-team-project-item">
                  <div className="proposal-team-project-header">
                    <h4>Proposal #{idx + 1}</h4>
                  </div>
                  <div className="proposal-team-project-body">
                    <p className="proposal-team-project-text">{proposal}</p>
                  </div>
                </div>
              ))}
              {team.project_proposals?.length > initialProposalLimit && (
                <button
                  className="proposal-team-show-more"
                  onClick={() => setShowAllProposals(!showAllProposals)}
                >
                  {showAllProposals ? 'Show Less' : `Show More (${team.project_proposals.length - initialProposalLimit} more)`}
                </button>
              )}
            </>
          ) : (
            <div className="proposal-team-no-projects">
              No proposals generated for this team
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamProposalCard;