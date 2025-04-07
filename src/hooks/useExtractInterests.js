import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { toast } from 'react-toastify'; // Add toast for error handling
import useProfileStore from '../store/profileStore';
import nsfService from '../services/nsfService';

const useExtractInterests = () => {
  const [isLoading, setIsLoadingState] = useState(false);
  const navigate = useNavigate();
  const { setExtractedProfiles, setIsLoading } = useProfileStore();

  const extractInterests = async (profiles) => {
    setIsLoadingState(true);
    setIsLoading(true);

    try {
      const data = await nsfService.extractInterests(profiles);
      setExtractedProfiles(data); // Store the extracted profiles in Zustand
      navigate('/profiles');
    } catch (error) {
      console.error(error);
      toast.error('Error extracting research interests. Please try again.');
    } finally {
      setIsLoadingState(false);
      setIsLoading(false);
    }
  };

  return { extractInterests, isLoading };
};

export default useExtractInterests;