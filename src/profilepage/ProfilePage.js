import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ProfilePage.css'; // Optional: Create this for styling

const ProfilePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const profiles = location.state?.profiles || [];
  const [isCreatingTeams, setIsCreatingTeams] = useState(false);

  const handleCreateTeams = async () => {
    if (profiles.length === 0) {
      alert('No profiles to create teams from.');
      return;
    }
    setIsCreatingTeams(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/teamcreation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profiles),
      });
      if (!response.ok) {
        throw new Error('Failed to create teams');
      }
      const data = await response.json();
      navigate('/teams', { state: { teams: data } });
    } catch (error) {
      alert('Error creating teams. Please try again.');
      console.error(error);
    } finally {
      setIsCreatingTeams(false);
    }
  };

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
      <div className="actions-container">
        <button
          onClick={handleCreateTeams}
          disabled={isCreatingTeams || profiles.length === 0}
          className="create-teams-button"
        >
          {isCreatingTeams ? (
            <>
              <div className="loading-spinner" />
              Creating Teams...
            </>
          ) : 'Create Teams'}
        </button>
        </div>
        <button onClick={() => navigate('/')} className="back-button">
          Back to Home
        </button>
    </div>
  );
};

export default ProfilePage;