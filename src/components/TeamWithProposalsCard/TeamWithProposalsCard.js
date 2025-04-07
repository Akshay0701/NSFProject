import React, { useState } from 'react';
import ProposalCard from '../ProposalCard';
import './TeamWithProposalsCard.css';

const TeamWithProposalsCard = ({ team }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleProposals = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <div className="team-card">
      <div className="card-header">
        <div className="team-meta">
          <h2>Team #{team.team_id}</h2>
          <span className="team-size">{team.team_size} members</span>
        </div>
        <button onClick={toggleProposals} className="toggle-proposals-btn">
          {isExpanded ? 'Hide Proposals' : 'Show Proposals'}
          <span className={`chevron ${isExpanded ? 'expanded' : ''}`}>▼</span>
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

        {isExpanded && (
          <div className="team-section">
            <h3 className="section-title">Project Proposals</h3>
            <div className="proposals-container">
              {team.project_proposals?.length > 0 ? (
                team.project_proposals.map((proposal, idx) => (
                  <ProposalCard key={idx} proposal={proposal} index={idx} />
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
  );
};

export default TeamWithProposalsCard;