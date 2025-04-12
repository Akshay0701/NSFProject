import React, { useState } from 'react';
import './ProfileCard.css';
import EditResearchModal from '../EditResearchModal';
import EditIcon from '../../assets/icons/EditIcon';

const ProfileCard = ({ profile, isCreator = true, onSaveTopics }) => {
  const [showModal, setShowModal] = useState(false);

  const handleSave = (updatedTopics) => {
    onSaveTopics(profile.email, updatedTopics);
    setShowModal(false);
  };

  return (
    <>
      <div className="profile-card">
        <div className="card-header">
          <h3>{profile.name}</h3>
          <span className="email-badge">{profile.email}</span>
          {isCreator && (
            <div className="action-icons">
              <button
                className="edit-btn"
                title="Edit Profile"
                onClick={() => setShowModal(true)}
              >
                <EditIcon />
              </button>
            </div>
          )}
        </div>
        <div className="card-body">
          <h4 className="section-title">Research Topics:</h4>
          {profile.research_topics?.length > 0 ? (
            <div className="topics-container">
              {profile.research_topics.map((topic, i) => (
                <span key={i} className="topic-tag">{topic}</span>
              ))}
            </div>
          ) : (
            <p className="no-topics">No topics extracted</p>
          )}
        </div>
      </div>

      {showModal && (
        <EditResearchModal
          profile={profile}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </>
  );
};

export default ProfileCard;
