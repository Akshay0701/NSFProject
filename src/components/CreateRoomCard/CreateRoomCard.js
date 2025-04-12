import React from 'react';

const CreateRoomCard = ({ onCreateRoom, isLoading }) => (
  <div className="action-card create-room">
    <div className="action-content">
      <h3>Start a new collaboration</h3>
      <p>Create a dedicated space for your research team</p>
      <button
        className="primary-button"
        onClick={onCreateRoom}
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="button-loader"></span>
        ) : (
          <>
            <span role="img" aria-label="Rocket" className="emoji-icon">🚀</span>
            Create New Room
          </>
        )}
      </button>
    </div>
  </div>
);

export default CreateRoomCard;
