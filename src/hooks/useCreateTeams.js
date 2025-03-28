import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import useProfileStore from '../store/profileStore';
import nsfService from '../services/nsfService';

const useCreateTeams = () => {
  const navigate = useNavigate();
  const { extractedProfiles, setIsCreatingTeams, setTeams } = useProfileStore();

  const createTeams = async () => {
    if (extractedProfiles.length === 0) return;

    setIsCreatingTeams(true);

    try {
      const data = await nsfService.createTeams(extractedProfiles);
      setTeams(data); // Store the teams in Zustand
      navigate('/teams');
    } catch (error) {
      console.error(error);
      toast.error('Error creating teams. Please try again.');
    } finally {
      setIsCreatingTeams(false);
    }
  };

  return { createTeams };
};

export default useCreateTeams;