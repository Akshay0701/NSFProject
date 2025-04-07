import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import useRoomPage from './useRoomPage';
import computingService from '../services/computingService';

const useTeamPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const { fetchTeams } = useRoomPage();

  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isGeneratingProposals, setIsGeneratingProposals] = useState(false);

  const generateProposals = useCallback(async (roomID) => {
    setIsGeneratingProposals(true);
    try {
      const result = await computingService.generateProposalsForRoom(roomID);
      toast.success('Proposals generated successfully!');
      navigate(`/room/${roomID}/teamswithproposal`);
      return result;
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate proposals.');
      return null;
    } finally {
      setIsGeneratingProposals(false);
    }
  }, [navigate]);

  const loadTeams = useCallback(async () => {
    try {
      const teamData = await fetchTeams(roomId);
      setTeams(teamData || []);
    } catch (err) {
      console.error('Error loading teams:', err);
      toast.error('Failed to load teams');
    } finally {
      setLoading(false);
    }
  }, [roomId, fetchTeams]);

  const handleGenerateProposals = useCallback(async () => {
    try {
      await generateProposals(roomId);
    } catch (err) {
      console.error('Proposal generation failed:', err);
      toast.error('Failed to generate proposals');
    }
  }, [roomId, generateProposals]);

  useEffect(() => {
    loadTeams();
  }, [loadTeams]);

  return {
    roomId,
    teams,
    loading,
    isGeneratingProposals,
    navigate,
    handleGenerateProposals,
  };
};

export default useTeamPage;
