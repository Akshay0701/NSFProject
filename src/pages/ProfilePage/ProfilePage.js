import React from 'react';
import { useNavigate } from 'react-router-dom';
import useProfileStore from '../../store/profileStore';
import useCreateTeams from '../../hooks/useCreateTeams';
import './ProfilePage.css';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { extractedProfiles, isCreatingTeams } = useProfileStore();
  const { createTeams } = useCreateTeams();

  return (
    <div className="profile-page">
      <header className="page-header">
        <h1 className="page-title">Researcher Profiles</h1>
        <div className="header-actions">
          <button onClick={() => navigate('/')} className="back-button">
            ← Back to Home
          </button>
        </div>
      </header>

      {extractedProfiles.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🧑🔬</div>
          <p className="empty-message">
            No profiles available. Please submit researcher profiles from the homepage.
          </p>
        </div>
      ) : (
        <div className="profiles-grid">
          {extractedProfiles.map((profile, index) => (
            <div key={index} className="profile-card">
              <div className="card-header">
                <h2 className="researcher-name">{profile.name}</h2>
                {profile.affiliation && (
                  <p className="affiliation">{profile.affiliation}</p>
                )}
              </div>

              <div className="research-section">
                <h3 className="section-title">Research Topics</h3>
                {profile.research_topics?.length > 0 ? (
                  <div className="topics-container">
                    {profile.research_topics.map((topic, idx) => (
                      <span key={idx} className="topic-tag">{topic}</span>
                    ))}
                  </div>
                ) : (
                  <p className="no-topics">No research topics extracted</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="actions-container">
        <button
          onClick={createTeams}
          disabled={isCreatingTeams || extractedProfiles.length === 0}
          className={`create-teams-button ${isCreatingTeams ? 'loading' : ''}`}
        >
          {isCreatingTeams ? (
            <>
              <div className="loading-spinner"></div>
              Generating Teams...
            </>
          ) : (
            'Create Research Teams'
          )}
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;