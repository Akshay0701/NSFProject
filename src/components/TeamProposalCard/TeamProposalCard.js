import React, { useState } from 'react';
import './TeamProposalCard.css';
import SearchIcon from '../../assets/icons/SearchIcon';
import MemberIcon from '../../assets/icons/MemberIcon';
import PageIcon from '../../assets/icons/PageIcon';

const getColorFromScore = (score) => {
  const red = Math.min(255, Math.floor(score * 255));
  const green = Math.min(255, Math.floor((1 - score) * 255));
  return `rgb(${red}, ${green}, 80)`;
};

const TeamProposalCard = ({ team, onGenerateProposals, generatingIndex }) => {
  const [showAllProposals, setShowAllProposals] = useState(false);
  const initialProposalLimit = 2;

  const proposalsToShow = showAllProposals
    ? team.project_proposals
    : team.project_proposals?.slice(0, initialProposalLimit);

  const similarityScores = team.similarity_project_score || [];
  const hasProposals = team.project_proposals?.length > 0;
  const isGenerating = generatingIndex === (team.team_id - 1);


  return (
    <div className="proposal-team-wrapper">
      {/* Left Panel */}
      <div className="proposal-team-details">
        <div className="proposal-team-title-bar">
          <h2>Team {team.team_id}</h2>
          <span className="proposal-team-size">
            {team.team_size} member{team.team_size !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="proposal-team-block">
          <h3 className="proposal-team-heading"><SearchIcon /> Research Focus</h3>
          <div className="proposal-team-tags">
            {team.team_research_areas.map((area, idx) => (
              <span key={idx} className="proposal-team-research-label">{area}</span>
            ))}
          </div>
        </div>

        <div className="proposal-team-block">
          <h3 className="proposal-team-heading"><MemberIcon /> Members</h3>
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
          <h3><PageIcon /> Project Proposals</h3>
          <div className="proposal-team-projects-meta">
            <span className="proposal-team-projects-count">
              {team.project_proposals?.length || 0} proposal{team.project_proposals?.length !== 1 ? 's' : ''}
            </span>
            <button
              className="generate-proposal-btn"
              disabled={hasProposals || isGenerating}
              onClick={() => onGenerateProposals(team.team_id - 1)}
            >
              {isGenerating ? 'Generating...' : 'Generate Proposals'}
            </button>
          </div>
        </div>

        <div className="proposal-team-projects-list">
          {isGenerating ? (
              <div className="proposal-team-loading">
                <p>Generating proposals...</p>
                <div className="spinner"></div>
              </div>
            ) : hasProposals ? (
              <>
                {proposalsToShow.map((proposal, idx) => {
                  const similarity = similarityScores[idx];
                  const score = similarity?.max_similarity_score ?? null;
                  const percentage = score !== null ? Math.round(score * 100) : null;
                  const color = score !== null ? getColorFromScore(score) : '#888';

                  return (
                    <div key={idx} className="proposal-team-project-item">
                      <div className="proposal-team-project-header">
                        <h4>Proposal #{idx + 1}</h4>
                        {percentage !== null && (
                          <div
                            className="similarity-circle"
                            title={`Similarity with funded project: ${percentage}%`}
                            style={{ backgroundColor: color }}
                          >
                            <span className="circle-text">{percentage}%</span>
                          </div>
                        )}
                      </div>
                      <div className="proposal-team-project-body">
                        <p className="proposal-team-project-text">{proposal}</p>
                      </div>
                    </div>
                  );
                })}
                {team.project_proposals.length > initialProposalLimit && (
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
