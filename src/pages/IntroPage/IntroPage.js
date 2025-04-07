import React from 'react';
import './IntroPage.css';
import useIntroPage from '../../hooks/useIntroPage';
import HeroSection from '../../components/HeroSection';
import CreateRoomCard from '../../components/CreateRoomCard';
import JoinRoomCard from '../../components/JoinRoomCard';
import RoomList from '../../components/RoomList';

const IntroPage = () => {
  const {
    roomID, setRoomID, error, setError,
    isLoading, userRooms,
    handleJoinRoom, handleCreateRoom, handleDeleteRoom
  } = useIntroPage();

  return (
    <div className="intro-page">
      <div className="container">
        <HeroSection />
        <div className="intro-actions">
          <CreateRoomCard onCreateRoom={handleCreateRoom} isLoading={isLoading} />
          <JoinRoomCard
            roomID={roomID}
            setRoomID={setRoomID}
            error={error}
            setError={setError}
            handleJoinRoom={handleJoinRoom}
            isLoading={isLoading}
          />
        </div>
        {isLoading ? (
          <div className="loading-rooms">
            <div className="spinner"></div>
            <p>Loading your rooms...</p>
          </div>
        ) : (
          <RoomList rooms={userRooms} handleDeleteRoom={handleDeleteRoom} />
        )}
      </div>
    </div>
  );
};

export default IntroPage;
