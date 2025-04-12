import roomService from '../services/roomService';
import computingService from '../services/computingService';
import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const useRoomPage = () => {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [extracting, setExtracting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [inputMethod, setInputMethod] = useState('description');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    description: '',
    pdfFile: null,
  });

  const userEmail = localStorage.getItem('userEmail');


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

  const extractTextFromPDF = useCallback(async (pdfFile) => {
    try {
      const data = await computingService.extractTextFromPDF(pdfFile);
      return data.text; // expects { text: '...' }
    } catch (err) {
      console.error(err);
      toast.error('Failed to extract text from PDF.');
      return '';
    }
  }, []);

  const extractTextFromLink = useCallback(async (link) => {
    try {
      const data = await computingService.extractTextFromLink(link);
      return data.text; // expects { text: '...' }
    } catch (err) {
      console.error(err);
      toast.error('Failed to extract text from PDF.');
      return '';
    }
  }, []);

  const removeProfile = useCallback(async ({ roomID, email, senderEmail }) => {
    try {
      const result = await roomService.removeProfileFromRoom({ roomID, email, senderEmail });
      toast.success('Profile removed successfully.');
      return result;
    } catch (err) {
      console.error(err);
      toast.error('Failed to remove profile.');
      throw err;
    }
  }, []);

  const addProfile = useCallback(async ({ roomID, name, email, description }) => {
    try {
      const result = await roomService.addProfileToRoom({ roomID, name, email, description });
      toast.success('Profile added successfully.');
      return result;
    } catch (err) {
      console.error(err);
      toast.error('Failed to add profile.');
      throw err;
    }
  }, []);

  const extracted_keywords = useCallback(async (roomID) => {
    try {
      const data = await computingService.extractResearchKeywords(roomID);
      navigate(`/room/${roomID}/profiles`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to extract keywords from room.');
      return [];
    }
  }, []);

  const fetchTeams = useCallback(async (roomID) => {
    try {
      const data = await roomService.getTeamsByRoom(roomID);
      return data; 
    } catch (err) {
      console.error(err);
      toast.error('Failed to load teams data');
      return [];
    }
  }, []);

  const loadRoom = useCallback(async () => {
    setLoading(true);
    const data = await fetchRoomData(roomId);
    setRoom(data);
    setLoading(false);
  }, [fetchRoomData, roomId]);

  useEffect(() => {
    loadRoom();
  }, [loadRoom]);

  const handleExtractResearch = async () => {
    try {
      setExtracting(true);
      const keywords = await extracted_keywords(roomId);
      if (!keywords.length) {
        toast.error('No research keywords extracted.');
      }
    } catch (err) {
      toast.error('Failed to extract research interests.');
    } finally {
      setExtracting(false);
    }
  };

  const handleDeleteProfile = async (emailToRemove) => {
    if (!window.confirm('Are you sure you want to remove this profile?')) return;

    try {
      await removeProfile({
        roomID: roomId,
        email: emailToRemove,
        senderEmail: userEmail,
      });
      await loadRoom();
    } catch (error) {
      toast.error('Failed to remove profile.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'pdfFile') {
      setFormData((prev) => ({ ...prev, pdfFile: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddProfile = async (e) => {
    e.preventDefault();
    const { name, email, description, pdfFile, websiteLink } = formData;
  
    // Validate required fields
    const isInvalid =
      !name ||
      !email ||
      (inputMethod === 'description' && !description) ||
      (inputMethod === 'pdf' && !pdfFile) ||
      (inputMethod === 'link' && !websiteLink);
  
    if (isInvalid) {
      toast.error('Please fill in all required fields');
      return;
    }
  
    try {
      let finalDescription = description;
  
      // If using PDF input
      if (inputMethod === 'pdf' && pdfFile) {
        const extractedText = await extractTextFromPDF(pdfFile);
        if (!extractedText) {
          toast.error('Failed to extract text from PDF.');
          return;
        }
        finalDescription = extractedText;
      }
  
      // If using Link input
      if (inputMethod === 'link' && websiteLink) {
        try {
          const extractedText = await extractTextFromLink(websiteLink);
          if (!extractedText) {
            toast.error('Failed to extract text from the website.');
            return;
          }
          finalDescription = extractedText;
        } catch (err) {
          toast.error('Error extracting text from the link.');
          return;
        }
      }
  
      await addProfile({ roomID: roomId, name, email, description: finalDescription });
      await loadRoom();
  
      setShowModal(false);
      setFormData({ name: '', email: '', description: '', pdfFile: null, websiteLink: '' });
  
    } catch (err) {
      console.error('Error adding profile:', err);
      toast.error('Failed to add profile. Please try again.');
    }
  };  

  return {
    roomId,
    room,
    setRoom,
    userEmail,
    loading,
    extracting,
    showModal,
    setShowModal,
    inputMethod,
    setInputMethod,
    formData,
    setFormData,
    handleAddProfile,
    handleDeleteProfile,
    handleInputChange,
    handleExtractResearch,
    fetchTeams,
  };
};

export default useRoomPage;

