import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ProfilePage.css'; // Optional: Create this for styling

const ProfilePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const profiles = location.state?.profiles || [];

  return (
    <div className="profile-page">
      <h1>Researcher Profiles with Extracted Topics</h1>
      {profiles.length === 0 ? (
        <p>No profiles available. Please submit researcher profiles from the homepage.</p>
      ) : (
        <div className="profiles-list">
          {profiles.map((profile, index) => (
            <div key={index} className="profile-card">
              <h2>{profile.name}</h2>
              <h3>Research Topics:</h3>
              {profile.research_topics && profile.research_topics.length > 0 ? (
                <ul>
                  {profile.research_topics.map((topic, idx) => (
                    <li key={idx}>{topic}</li>
                  ))}
                </ul>
              ) : (
                <p>No research topics extracted.</p>
              )}
            </div>
          ))}
        </div>
      )}
      <button 
        onClick={() => navigate('/')} 
        className="back-button"
      >
        Back to Home
      </button>
    </div>
  );
};

export default ProfilePage;