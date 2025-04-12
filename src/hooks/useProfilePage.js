import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import computingService from '../services/computingService';
import roomService from '../services/roomService';


const useProfilePage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [profiles, setProfiles] = useState([]);

  const [isCreatingTeams, setIsCreatingTeams] = useState(false);

  const createTeams = async (roomID) => {
    setIsCreatingTeams(true);
    try {
      const data = await roomService.createTeamsFromRoom(roomID);
      toast.success('Teams created successfully!');
      navigate(`/room/${roomID}/teams`);
      return data;
    } catch (err) {
      console.error('Create teams error:', err);
      toast.error(err.message || 'Failed to create teams');
    } finally {
      setIsCreatingTeams(false);
    }
  };

  const fetchExtractedKeywords = useCallback(async (roomID) => {
    try {
      const data = await computingService.getExtractedKeywords(roomID);
      return data || [];
    } catch (error) {
      console.error('Error fetching extracted keywords:', error);
      toast.error('Failed to fetch extracted keywords.');
      return [];
    }
  }, []);

  const loadProfiles = useCallback(async () => {
    if (!roomId) return;
    try {
      const keywords = await fetchExtractedKeywords(roomId);
      setProfiles(keywords || []);
    } catch (error) {
      toast.error("Failed to load research profiles.");
    }
  }, [roomId, fetchExtractedKeywords]);

  const handleGenerateTeams = useCallback(async () => {
    if (!roomId) return;
    await createTeams(roomId);
  }, [roomId, createTeams]);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  return {
    profiles,
    roomId,
    navigate,
    isCreatingTeams,
    handleGenerateTeams,
  };
};

export default useProfilePage;
