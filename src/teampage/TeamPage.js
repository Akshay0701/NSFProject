import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './TeamPage.css'; // Updated styles will be in this file

const TeamPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const teams = location.state?.teams || [];

  return (
    <div className="team-page">
      <h1>Research Teams</h1>
      {teams.length === 0 ? (
        <p className="no-teams">No teams formed.</p>
      ) : (
        <div className="teams-list">
          {teams.map((team) => (
            <div key={team.team_id} className="team-card">
              <h2>Team {team.team_id} (Size: {team.team_size})</h2>
              <h3>Team Research Areas:</h3>
              <div className="team-research-areas">
                {team.team_research_areas.map((area, idx) => (
                  <span key={idx} className="research-area-tag">{area}</span>
                ))}
              </div>
              <h3>Members:</h3>
              <table>
                <thead>
                  <tr>
                    <th>Member Name</th>
                    <th>Fields</th>
                  </tr>
                </thead>
                <tbody>
                  {team.members.map((member) => (
                    <tr key={member}>
                      <td>{member}</td>
                      <td>{team.member_fields[member].join(', ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
      <button onClick={() => navigate('/')} className="back-button">
        Back to Home
      </button>
    </div>
  );
};

export default TeamPage;