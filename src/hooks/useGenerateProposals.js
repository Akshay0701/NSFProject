import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import useProfileStore from '../store/profileStore';
import nsfService from '../services/nsfService';

const useGenerateProposals = () => {
  const navigate = useNavigate();
  const { teams, setIsGeneratingProposals, setTeamsWithProposals } = useProfileStore();

  const generateProposals = async () => {
    if (teams.length === 0) return;

    setIsGeneratingProposals(true);

    try {
      const data = await nsfService.generateProposals(teams);
      setTeamsWithProposals(data); // Store the teams with proposals in Zustand
      navigate('/teamswithproposal');
    } catch (error) {
      console.error(error);
      toast.error('Error generating proposals. Please try again later.');
    } finally {
      setIsGeneratingProposals(false);
    }
  };

  return { generateProposals };
};

export default useGenerateProposals;