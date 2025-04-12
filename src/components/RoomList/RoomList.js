import React, { useState } from 'react';
import TrashIcon from '../../assets/icons/TrashIcon';

const RoomList = ({ rooms, title = 'Your Recent Rooms', handleDeleteRoom }) => {
  const [showAll, setShowAll] = useState(false);

  if (!rooms.length) return null;

  const displayedRooms = showAll ? rooms : rooms.slice(0, 4);

  return (
    <div className="room-list-section">
      <div className="section-header">
        <h2>{title}</h2>
        {rooms.length > 3 && (
          <button
            className="text-button"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'Show Less' : 'View All'}
          </button>
        )}
      </div>
      <div className="room-grid">
        {displayedRooms.map((room) => (
          <div key={room.RoomID} className="room-card">
            <div
              className="card-content"
              onClick={() => window.location.href = `/room/${room.RoomID}`}
            >
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
            {handleDeleteRoom && (
              <button
                className="delete-btn"
                title="Delete Profile"
                onClick={() => handleDeleteRoom(room.RoomID)}
              >
                <TrashIcon />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomList;
