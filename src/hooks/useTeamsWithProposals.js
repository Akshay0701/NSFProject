import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useRoomPage from './useRoomPage';

const useTeamsWithProposals = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { fetchTeams, isLoading } = useRoomPage();

  const [teamsWithProposals, setTeamsWithProposals] = useState([]);

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

  return {
    roomId,
    navigate,
    teamsWithProposals,
    isLoading
  };
};

export default useTeamsWithProposals;
