// src/hooks/useIntroPage.js
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import roomService from '../services/roomService';

const useIntroPage = () => {
  const navigate = useNavigate();
  const [roomID, setRoomID] = useState('');
  const [roomIDCreate, setRoomIDCreate] = useState('');
  const [error, setError] = useState('');
  const [userRooms, setUserRooms] = useState([]);
  const [addedRooms, setAddedRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedRoomIDs, setSuggestedRoomIDs] = useState([]);

  const userEmail = localStorage.getItem('userEmail');

  const createRoom = useCallback(async (creatorID, roomID = null) => {
    try {
      const result = await roomService.createRoom(creatorID, roomID);
      toast.success('Room created successfully.');
      setSuggestedRoomIDs([]);  // Clear suggestions if successful
      return result;
    } catch (err) {
      console.error(err);
  
      if (roomID) {
        const suggestions = Array.from({ length: 3 }, (_, i) => {
          const suffix = Math.floor(Math.random() * 10000);
          return `${roomID}-${suffix}`;
        });
        setSuggestedRoomIDs(suggestions);
        toast.error(`${err.message}`);
      } else {
        toast.error(`${err.message}`);
      }
  
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

  const getAddedRoomsByEmail = useCallback(async (email) => {
    try {
      const data = await roomService.getAddedRoomsByEmail(email);
      return data.rooms || [];
    } catch (err) {
      console.error(err);
      toast.error(`${err.message}`);
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
      const [createdRooms, joinedRooms] = await Promise.all([
        getRoomsByEmail(userEmail),
        getAddedRoomsByEmail(userEmail),
      ]);
      setUserRooms(createdRooms);
      setAddedRooms(joinedRooms);
    } catch {
      toast.error('Could not fetch rooms');
    } finally {
      setIsLoading(false);
    }
  }, [userEmail, getRoomsByEmail, getAddedRoomsByEmail]);

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
      const trimmedID = roomIDCreate.trim();
      let res = null; 
  
      if (!trimmedID) {
        res = await createRoom(userEmail);
      } else {
        res = await createRoom(userEmail, trimmedID);
      }
  
      const newRoomId = res.RoomID;
      navigate(`/room/${newRoomId}`);
    } catch {
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
    roomIDCreate,
    suggestedRoomIDs,
    addedRooms,
    setRoomID,
    setRoomIDCreate,
    setSuggestedRoomIDs,
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
