import React from 'react';
import './ProfilePage.css';
import useProfilePage from '../../hooks/useProfilePage';
import ProfileCard from '../../components/ProfileCard';
import PageHeader from '../../components/PageHeader';

const ProfilePage = () => {
  const {
    loading,
    room,
    userEmail,
    navigate,
    isCreatingTeams,
    handleGenerateTeams,
    updateResearchTopicsForUser
  } = useProfilePage();

  const profiles = room?.extracted_keywords || {};

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading room data...</p>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="error-container">
        <h2>Room not found</h2>
        <p>The room you're looking for doesn't exist or may have been deleted.</p>
      </div>
    );
  }

  return (
    <div className="room-page">
      <PageHeader
        title="Research Profiles"
        subtitle={`Created by: ${room?.creatorID}`}
        actions={
          <button onClick={() => navigate('/')} className="secondary-button">
            ← Back to Home
          </button>
        }
      />

      <div className="content-container">
        {profiles.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔬</div>
            <h3>No Profiles Available</h3>
            <p>Extract research profiles from the room page to get started</p>
            <button onClick={() => navigate('/')} className="primary-button">
              Go to Homepage
            </button>
          </div>
        ) : (
          <>
            <div className="profile-grid">
            {Object.values(profiles).map((profile, idx) => (
              <ProfileCard 
              key={idx} 
              profile={profile} 
              isCreator={userEmail === room.creatorID || profile.email === userEmail}
              onSaveTopics={updateResearchTopicsForUser} />
            ))}
            </div>

            <div className="generate-teams-container">
              <button
                className="generate-teams-btn"
                onClick={handleGenerateTeams}
                disabled={isCreatingTeams || profiles.length === 0}
              >
                {isCreatingTeams ? (
                  'Creating Teams...'
                ) : (
                  'Generate Research Teams'
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
