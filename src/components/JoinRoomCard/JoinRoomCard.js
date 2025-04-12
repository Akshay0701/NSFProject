import React from 'react';

const JoinRoomCard = ({ roomID, setRoomID, error, setError, handleJoinRoom, isLoading }) => (
  <div className="action-card join-room">
    <div className="action-content">
      <h3>Join existing room</h3>
      <p>Enter the Room ID provided by your collaborator</p>
      <div className="join-form">
        <input
          type="text"
          placeholder="Enter Room ID"
          value={roomID}
          onChange={(e) => {
            setRoomID(e.target.value);
            setError('');
          }}
          aria-label="Room ID"
          className="text-input"
        />
        <button
          className="secondary-button"
          onClick={handleJoinRoom}
          disabled={isLoading}
        >
          <span role="img" aria-label="Key" className="emoji-icon">🔑</span>
          Join Room
        </button>
      </div>
      {error && <p className="error-message">{error}</p>}
    </div>
  </div>
);

export default JoinRoomCard;
