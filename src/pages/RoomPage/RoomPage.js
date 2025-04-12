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
    setFormData,
    addProfileText,
    inputMethod,
    setInputMethod,
    formData,
    handleInputChange,
    handleAddProfile,
    setAddProfileText,
    handleExtractResearch,
    extracting,
    handleDeleteProfile,
    userEmail,
  } = useRoomPage();

  const handleAddProfileShow = () => {
    setAddProfileText('Add Profile')
    setFormData({
      name: '',
      email: '',
      description: '',
      pdfFile: null,
    });
    setShowModal(true);
  };

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
        showCopyButton={true}
        actions={
          <>
            <button className="primary-button" onClick={() => handleAddProfileShow()}>
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
                  setAddProfileText = {setAddProfileText}
                  setFormData={setFormData}
                  setShowModal={setShowModal}
                  key={idx}
                  profile={profile}
                  isCreator={room.creatorID === userEmail || profile.email === userEmail}
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
            <button className="primary-button" onClick={() => handleAddProfileShow()}>
              Add Profile
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <AddProfileModal
          addProfileText = {addProfileText}
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
