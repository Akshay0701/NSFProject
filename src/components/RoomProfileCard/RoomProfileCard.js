import React from 'react';
import './RoomProfileCard.css';
import EditIcon from '../../assets/icons/EditIcon';
import TrashIcon from '../../assets/icons/TrashIcon';

const RoomProfileCard = ({ setFormData, profile, isCreator, onDelete, setShowModal, setAddProfileText }) => {

  const handleEdit = () => {
    setAddProfileText('Update Profile')
    setFormData({
      name: profile.name || '',
      email: profile.email || '',
      description: profile.description || '',
      pdfFile: null,
    });
    setShowModal(true);
  };

  return (
    <div className="profile-card">
      <div className="card-header">
        <h3>{profile.name}</h3>
        <span className="email-badge">{profile.email}</span>
        {isCreator && (
          <div className="action-icons">
            <button
              className="edit-btn"
              title="Edit Profile"
              onClick={handleEdit}
            >
              <EditIcon />
            </button>
            <button
              className="delete-btn"
              title="Delete Profile"
              onClick={() => onDelete(profile.email)}
            >
              <TrashIcon />
            </button>
          </div>
        )}
      </div>
      <div className="card-body">
        <p className="profile-desc">{profile.description || 'No description provided'}</p>
      </div>
    </div>
  );
};

export default RoomProfileCard;
