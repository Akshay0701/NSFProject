// src/hooks/useIntroPage.js
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import roomService from '../services/roomService';

const useIntroPage = () => {
  const navigate = useNavigate();
  const [roomID, setRoomID] = useState('');
  const [error, setError] = useState('');
  const [userRooms, setUserRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const userEmail = localStorage.getItem('userEmail');

  const createRoom = useCallback(async (creatorID) => {
    try {
      const result = await roomService.createRoom(creatorID);
      toast.success('Room created successfully.');
      return result; // { message, RoomID }
    } catch (err) {
      console.error(err);
      toast.error('Failed to create room.');
      throw err;
    }
  }, []);

  const getRoomsByEmail = useCallback(async (email) => {
    try {
      const data = await roomService.getRoomsByEmail(email);
      return data.rooms || [];
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch rooms by email.');
      return [];
    }
  }, []);

  const removeRoom = useCallback(async ({roomID, email}) => {
    try {
      const result = await roomService.removeRoomData({ roomID, email});
      toast.success('Room removed successfully.');
      return result;
    } catch (err) {
      console.error(err);
      toast.error('Failed to remove room.');
      throw err;
    }
  }, [])

  const fetchRooms = useCallback(async () => {
    if (!userEmail) {
      toast.error('Please log in to view your rooms');
      return;
    }

    setIsLoading(true);
    try {
      const rooms = await getRoomsByEmail(userEmail);
      setUserRooms(rooms);
    } catch {
      toast.error('Could not fetch rooms');
    } finally {
      setIsLoading(false);
    }
  }, [userEmail, getRoomsByEmail]);

  const handleJoinRoom = () => {
    const trimmedID = roomID.trim();
    if (!trimmedID) {
      setError('Please enter a Room ID');
      return;
    }
    setError('');
    navigate(`/room/${trimmedID}`);
  };

  const handleCreateRoom = async () => {
    if (!userEmail) {
      toast.error('Please log in to create a room');
      return;
    }

    setIsLoading(true);
    try {
      const res = await createRoom(userEmail);
      const newRoomId = res.RoomID;
      navigate(`/room/${newRoomId}`);
    } catch {
      toast.error('Failed to create room. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRoom = async (roomID) => {
    if (!window.confirm('Are you sure you want to delete this room?')) return;
    try {
      await removeRoom({ roomID, email: userEmail });
      fetchRooms();
    } catch {
      toast.error('Failed to delete room');
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  return {
    roomID,
    setRoomID,
    error,
    setError,
    isLoading,
    userRooms,
    handleJoinRoom,
    handleCreateRoom,
    handleDeleteRoom,
  };
};

export default useIntroPage;
