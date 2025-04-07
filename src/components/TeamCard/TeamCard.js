import React from 'react';
import './TeamCard.css'

const TeamCard = ({ team }) => {
  return (
    <div className="team-card" key={team.team_id}>
      <div className="team-card-header">
        <h3>Team {team.team_id}</h3>
        <span className="team-size-badge">
          {team.team_size} member{team.team_size !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="team-card-body">
        <h4 className="team-section-title">Research Focus:</h4>
        <div className="team-topics-container">
          {team.team_research_areas.map((area, idx) => (
            <span key={idx} className="team-topic-tag">{area}</span>
          ))}
        </div>

        <h4 className="team-section-title" style={{ marginTop: '1rem' }}>Members:</h4>
        <div className="team-members-list">
          {team.members.map((member, idx) => (
            <div key={idx} className="team-member-item">
              <div className="team-member-name">{member}</div>
              <div className="team-member-topics">
                {team.member_fields[member].map((field, i) => (
                  <span key={i} className="team-field-tag">{field}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeamCard;