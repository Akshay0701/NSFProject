import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import computingService from '../services/computingService';
import roomService from '../services/roomService';


const useProfilePage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [room, setRoom] = useState(null);
  const [isCreatingTeams, setIsCreatingTeams] = useState(false);

  const userEmail = localStorage.getItem('userEmail');

  const createTeams = async (roomID) => {
    setIsCreatingTeams(true);
    try {
      const data = await roomService.createTeamsFromRoom(roomID);
      navigate(`/room/${roomID}/teamswithproposal`);
      return data;
    } catch (err) {
      console.error('Create teams error:', err);
      toast.error(err.message || 'Failed to create teams');
    } finally {
      setIsCreatingTeams(false);
    }
  };

  const updateResearchTopicsForUser = useCallback(async (email, updatedKeywordsList) => {
    try {
      const response = await computingService.updateResearchTopicsForUser(roomId, email, updatedKeywordsList);
      loadRoom();
      return response;
    } catch (err) {
      toast.error(err.message || 'Update failed');
      return null;
    }
  }, []); 

  const fetchRoomData = useCallback(async (roomId) => {
    try {
      const data = await roomService.getRoomData(roomId);
      console.log('data at useRoom page:', data);
      return data;
    } catch (err) {
      console.error(err);
      toast.error('Failed to load room data.');
      return null;
    }
  }, []);


  const loadRoom = useCallback(async () => {
    setLoading(true);
    const data = await fetchRoomData(roomId);
    setRoom(data);
    setLoading(false);
  }, [fetchRoomData, roomId]);

  const handleGenerateTeams = useCallback(async () => {
    if (!roomId) return;
    await createTeams(roomId);
  }, [roomId, createTeams]);

  useEffect(() => {
    loadRoom();
  }, [loadRoom]);

  return {
    loading,
    room,
    roomId,
    userEmail,
    navigate,
    isCreatingTeams,
    handleGenerateTeams,
    updateResearchTopicsForUser
  };
};

export default useProfilePage;
