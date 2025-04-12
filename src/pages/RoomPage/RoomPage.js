import React from 'react';
import useRoomPage from '../../hooks/useRoomPage';
import PageHeader from '../../components/PageHeader';
import RoomProfileCard from '../../components/RoomProfileCard';
import AddProfileModal from '../../components/AddProfileModal';
import './RoomPage.css';

const RoomPage = () => {
  const {
    room,
    loading,
    showModal,
    setShowModal,
    inputMethod,
    setInputMethod,
    formData,
    handleInputChange,
    handleAddProfile,
    handleExtractResearch,
    extracting,
    handleDeleteProfile,
    userEmail,
  } = useRoomPage();

  const profiles = room?.profiles || {};

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
        title={`Room: ${room.RoomID}`}
        subtitle={`Created by: ${room.creatorID}`}
        actions={
          <>
            <button className="primary-button" onClick={() => setShowModal(true)}>
              + Add Profile
            </button>
            <button
              className="secondary-button"
              onClick={() => window.location.href = `/room/${room.RoomID}/teamswithproposal`}
            >
              View Proposals
            </button>
          </>
        }
      />

      <div className="content-container">
        {Object.keys(profiles).length > 0 ? (
          <>
            <div className="profile-grid">
              {Object.values(profiles).map((profile, idx) => (
                <RoomProfileCard
                  key={idx}
                  profile={profile}
                  isCreator={room.creatorID === userEmail}
                  onDelete={handleDeleteProfile}
                />
              ))}
            </div>

            <div className="action-container">
              <button
                className="generate-button"
                onClick={handleExtractResearch}
                disabled={extracting || Object.values(profiles).length === 0}
              >
                {extracting ? 'Processing...' : 'Extract Research Interests'}
              </button>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📂</div>
            <h3>No profiles yet</h3>
            <p>Add the first profile to get started</p>
            <button className="primary-button" onClick={() => setShowModal(true)}>
              Add Profile
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <AddProfileModal
          formData={formData}
          inputMethod={inputMethod}
          setInputMethod={setInputMethod}
          handleInputChange={handleInputChange}
          handleAddProfile={handleAddProfile}
          setShowModal={setShowModal}
        />
      )}
    </div>
  );
};

export default RoomPage;
