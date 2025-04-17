import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useRoomPage from './useRoomPage';
import computingService from '../services/computingService';
import { toast } from 'react-toastify';

const useTeamsWithProposals = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { fetchTeams, isLoading } = useRoomPage();

  const [teamsWithProposals, setTeamsWithProposals] = useState([]);
  const [comparing, setComparing] = useState(false); 

  const loadTeams = useCallback(async () => {
    if (!roomId) return;
    try {
      const teams = await fetchTeams(roomId);
      setTeamsWithProposals(teams);
    } catch (err) {
      console.error('Error loading teams with proposals:', err);
    }
  }, [roomId, fetchTeams]);

  useEffect(() => {
    loadTeams();
  }, [loadTeams]);

  const handleCompareFundedProjects = useCallback(async () => {
    if (!roomId) return;
    setComparing(true);
    try {
      await computingService.compareFundedProjects(roomId);
      await loadTeams(); 
    } catch (err) {
      toast.error(err.message);
      console.error('Error comparing funded projects:', err);
    } finally {
      setComparing(false);
    }
  }, [roomId, loadTeams]);

  return {
    roomId,
    navigate,
    teamsWithProposals,
    isLoading,
    comparing,                
    handleCompareFundedProjects, 
  };
};

export default useTeamsWithProposals;
