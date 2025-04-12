import React from 'react';
import './ProfilePage.css';
import useProfilePage from '../../hooks/useProfilePage';
import ProfileCard from '../../components/ProfileCard';
import PageHeader from '../../components/PageHeader';

const ProfilePage = () => {
  const {
    profiles,
    navigate,
    isCreatingTeams,
    handleGenerateTeams
  } = useProfilePage();

  return (
    <div className="room-page">
      <PageHeader
        title="Research Profiles"
        subtitle={`${profiles.length} ${profiles.length === 1 ? 'profile' : 'profiles'} extracted`}
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
              {profiles.map((profile, idx) => (
                <ProfileCard key={idx} profile={profile} />
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
