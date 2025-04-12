import React from 'react';
import './RoomProfileCard.css'

const RoomProfileCard = ({ profile, isCreator, onDelete }) => {
  return (
    <div className="profile-card">
      <div className="card-header">
        <h3>{profile.name}</h3>
        <span className="email-badge">{profile.email}</span>
        {isCreator && (
          <button
            className="delete-btn"
            title="Delete Profile"
            onClick={() => onDelete(profile.email)}
          >
            🗑️
          </button>
        )}
      </div>
      <div className="card-body">
        <p className="profile-desc">{profile.description || 'No description provided'}</p>
      </div>
    </div>
  );
};

export default RoomProfileCard;
