import React from 'react';
import './CreateRoomCard.css'; // Make sure to style the suggestion chips

const CreateRoomCard = ({
  roomIDCreate,
  setRoomIDCreate,
  onCreateRoom,
  isLoading,
  suggestedRoomIDs = []  // new optional prop
}) => (
  <div className="action-card create-room">
    <div className="action-content">
      <h3>Start a new collaboration</h3>
      <p>Create a dedicated space for your research team</p>

      <div className="join-form">
        <input
          type="text"
          placeholder="Enter custom Room ID (optional)"
          value={roomIDCreate}
          onChange={(e) => {
            setRoomIDCreate(e.target.value);
          }}
          aria-label="Custom Room ID"
          className="text-input"
        />
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

      {/* Suggested IDs */}
      {suggestedRoomIDs.length > 0 && (
        <div className="suggestion-container">
          <div className="suggestion-chips">
            {suggestedRoomIDs.map((id) => (
              <button
                key={id}
                className="chip"
                onClick={() => setRoomIDCreate(id)}
              >
                {id}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
);

export default CreateRoomCard;
