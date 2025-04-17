import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as XLSX from 'xlsx';
import roomService from '../services/roomService';

const usePreviouslyFundedProjects = () => {
  const [projects, setProjects] = useState([]);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [editedAbstract, setEditedAbstract] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const { roomId } = useParams();
  const navigate = useNavigate();

  // Helper to generate unique IDs (simple version)
  const generateId = useCallback(() => Date.now() + Math.random(), []);

  const handleDeleteAllProjects = useCallback(() => {
    setProjects([]);
  });

  // Handle CSV File Upload using Papaparse
  const handleFileChange = useCallback((event) => {
    const file = event.target.files[0];
    const inputTarget = event.currentTarget;
  
    if (!file) return;
  
    setIsLoading(true);
    setError(null);
  
    const reader = new FileReader();
  
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const sheetData = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });
  
        if (!sheetData.length) throw new Error("Excel sheet is empty.");
        const headers = Object.keys(sheetData[0]);
        const abstractKey = headers.find(h => h.trim().toLowerCase() === 'abstract');
  
        if (!abstractKey) {
          throw new Error(`Missing 'Abstract' column. Found: [${headers.join(', ')}]`);
        }
  
        const newProjects = sheetData
            .map(row => ({
            id: generateId(),
            abstract: (row[abstractKey] || '').trim(),
            }))
            .filter(p => p.abstract);
  
        if (!newProjects.length) {
          throw new Error(`No valid abstracts found in the '${abstractKey}' column.`);
        }
  
        setProjects(prev => {
            const remaining = 50 - prev.length;
            if (remaining <= 0) {
              setError("You have reached the maximum limit of 50 projects.");
              return prev;
            }
            const toAdd = newProjects.slice(0, remaining);
            if (toAdd.length < newProjects.length) {
              setError(`Only ${toAdd.length} of ${newProjects.length} projects were added to stay within the 50-project limit.`);
            }
            return [...prev, ...toAdd];
        });
      } catch (err) {
        console.error("Excel Parse Error:", err);
        setError(err.message || "Failed to parse file.");
      } finally {
        if (inputTarget) inputTarget.value = null;
        setIsLoading(false);
      }
    };
  
    reader.onerror = () => {
      setError("Failed to read file.");
      setIsLoading(false);
      if (inputTarget) inputTarget.value = null;
    };
  
    reader.readAsArrayBuffer(file);
  }, [generateId]);
  

  const addProject = useCallback(() => {
    setError(null);
    setProjects(prevProjects => {
      if (prevProjects.length >= 50) {
        setError("Cannot add more than 50 projects.");
        return prevProjects;
      }
      const newProject = {
        id: generateId(),
        abstract: '',
      };
      return [...prevProjects, newProject];
    });
  }, [generateId]);

  // Delete a project
  const deleteProject = useCallback((idToDelete) => {
    setError(null); // Clear error when deleting
    setProjects(prevProjects => prevProjects.filter(p => p.id !== idToDelete));
    if (editingProjectId === idToDelete) {
        setEditingProjectId(null); // Cancel edit if deleting the edited row
        setEditedAbstract('');
    }
  }, [editingProjectId]);

  // Start editing a project's abstract
  const startEditing = useCallback((project) => {
    setError(null); // Clear error when editing
    setEditingProjectId(project.id);
    setEditedAbstract(project.abstract);
  }, []);

  // Cancel the current edit
  const cancelEditing = useCallback(() => {
    setEditingProjectId(null);
    setEditedAbstract('');
  }, []);

  // Save the edited abstract for a single project row
  const saveEdit = useCallback(() => {
    setError(null); // Clear error when saving edit
    if (editingProjectId === null) return;
    setProjects(prevProjects =>
      prevProjects.map(p =>
        p.id === editingProjectId ? { ...p, abstract: editedAbstract.trim() } : p // Trim on save too
      )
    );
    setEditingProjectId(null);
    setEditedAbstract('');
  }, [editingProjectId, editedAbstract]);

  // Handle changes in the edit textarea
  const handleEditInputChange = useCallback((event) => {
    setEditedAbstract(event.target.value);
  }, []);

  // Placeholder for the final save action (e.g., to backend)
  const saveAllProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const abstracts = projects
        .map(p => p.abstract.trim())
        .filter(a => a); // Only non-empty

      const response = await roomService.saveFundedProjects(roomId, abstracts);

      navigate(`/room/${roomId}`);
    } catch (err) {
      setError(err.message || "An unknown error occurred while saving.");
    } finally {
      setIsLoading(false);
    }
  }, [projects, roomId, navigate]);

  useEffect(() => {
    const loadInitialProjects = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await roomService.getFundedProjects(roomId);
        const projectMap = result.projects || {};
  
        const loadedProjects = Object.values(projectMap)
          .map((abstract, idx) => ({
            id: generateId(), // unique ID
            abstract: abstract.trim()
          }))
          .filter(p => p.abstract); // filter non-empty
  
        setProjects(loadedProjects);
      } catch (err) {
        console.error("Error loading funded projects:", err);
        setError(err.message || "Failed to load funded projects");
      } finally {
        setIsLoading(false);
      }
    };
  
    if (roomId) {
      loadInitialProjects();
    }
  }, [roomId]);

  return {
    projects,
    editingProjectId,
    editedAbstract,
    isLoading,
    error,
    handleFileChange,
    addProject,
    deleteProject,
    startEditing,
    cancelEditing,
    saveEdit,
    handleEditInputChange,
    handleDeleteAllProjects,
    saveAllProjects,
    setError // Expose setError to allow clearing errors manually if needed
  };
};

export default usePreviouslyFundedProjects;