// src/hooks/useNSFSolicitation.js
import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import roomService from '../services/roomService';
import computingService from '../services/computingService';

const useNSFSolicitation = () => {
  const { roomId } = useParams();

  const [keywords, setKeywords] = useState([]);
  const [editedKeywords, setEditedKeywords] = useState([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingPDF, setIsUploadingPDF] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const triggerFileUpload = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const fetchRoomData = useCallback(async () => {
    try {
      const data = await roomService.getRoomData(roomId);
      if (Array.isArray(data?.nsf_solicitation)) {
        setKeywords(data.nsf_solicitation);
        setEditedKeywords(data.nsf_solicitation);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load room data');
      setError(err.message);
    }
  }, [roomId]);

  const handleFileUpload = useCallback(async (file) => {
    if (!file || !roomId) return;

    setIsUploadingPDF(true);
    try {
      const { text } = await computingService.extractTextFromPDF(file);
      const { keywords: extractedKeywords } = await computingService.extractNSFSolicitationKeywords(roomId, text);
      setKeywords(extractedKeywords);
      setEditedKeywords(extractedKeywords);
      toast.success("Keywords extracted from PDF!");
    } catch (err) {
      console.error(err);
      setError(err.message);
      toast.error('Failed to extract keywords');
    } finally {
      setIsUploadingPDF(false);
    }
  }, [roomId]);

  const addKeyword = () => {
    const trimmed = newKeyword.trim();
    if (trimmed && !editedKeywords.includes(trimmed)) {
      setEditedKeywords(prev => [...prev, trimmed]);
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword) => {
    setEditedKeywords(prev => prev.filter(k => k !== keyword));
  };

  const saveKeywords = async () => {
    try {
      setKeywords(editedKeywords);
      await roomService.updateKeywordsForNSFSolicitaion(roomId, editedKeywords);
    } catch (err) {
      toast.error("Failed to update keywords");
      setError(err.message);
    } finally {
      setIsEditing(false);
    }
  };

  const cancelEdit = () => {
    setEditedKeywords(keywords);
    setNewKeyword('');
    setIsEditing(false);
  };

  useEffect(() => {
    if (roomId) fetchRoomData();
  }, [roomId, fetchRoomData]);

  return {
    keywords,
    editedKeywords,
    isEditing,
    isUploadingPDF,
    error,
    newKeyword,
    fileInputRef,
    setNewKeyword,
    setIsEditing,
    triggerFileUpload,
    handleFileUpload,
    addKeyword,
    removeKeyword,
    saveKeywords,
    cancelEdit
  };
};

export default useNSFSolicitation;
