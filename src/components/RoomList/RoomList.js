import React from 'react';

const RoomList = ({ rooms, handleDeleteRoom }) => {
  if (!rooms.length) return null;

  return (
    <div className="room-list-section">
      <div className="section-header">
        <h2>Your Recent Rooms</h2>
        {rooms.length > 3 && (
          <button className="text-button">View all</button>
        )}
      </div>
      <div className="room-grid">
        {rooms.map((room) => (
          <div key={room.RoomID} className="room-card">
            <div className="card-content" onClick={() => window.location.href = `/room/${room.RoomID}`}>
              <h3>{room.name || `Room ${room.RoomID.slice(0, 6)}`}</h3>
              <div className="room-stats">
                <span className="stat">
                  <strong>{Object.keys(room.profiles || {}).length}</strong> members
                </span>
                <span className="stat">
                  <strong>{room.lastActive || 'New'}</strong>
                </span>
              </div>
            </div>
            <div className="delete-room" onClick={() => handleDeleteRoom(room.RoomID)}>
              <span role="img" aria-label="Delete" className="emoji-icon">🗑️</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomList;
