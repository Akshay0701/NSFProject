import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

// Custom icons as SVG components (simplified)
const CustomIcons = {
  UserPlus: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <line x1="20" y1="8" x2="20" y2="14" />
      <line x1="23" y1="11" x2="17" y2="11" />
    </svg>
  ),
  UserMinus: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <line x1="23" y1="11" x2="17" y2="11" />
    </svg>
  )
};

// Default research areas
const researchAreas = [
  "Computer Science",
  "Environmental Science",
  "Materials Science",
  "Physics",
  "Biology",
  "Chemistry",
  "Engineering",
  "Mathematics",
  "Social Sciences",
  "Other"
];

// Initial researcher profile template
const initialResearcherProfile = {
  name: '',
  affiliation: '',
  researchArea: '',
  text: '',
  expanded: true
};

const ResearcherProfile = ({ 
  profile, 
  index, 
  updateProfile, 
  removeProfile, 
  isFirst, 
  total 
}) => {
  const toggleExpanded = () => {
    updateProfile(index, { ...profile, expanded: !profile.expanded });
  };

  const handleTextChange = (e) => {
    updateProfile(index, { ...profile, text: e.target.value });
  };

  return (
    <div className="researcher-profile">
      <div className="profile-header" onClick={toggleExpanded}>
        <div className="profile-title">
          <h3>
            {profile.name ? profile.name : `Researcher ${index + 1}`}
            {profile.affiliation ? ` - ${profile.affiliation}` : ''}
          </h3>
        </div>
        <button className="toggle-button">
          {profile.expanded ? '▲' : '▼'}
        </button>
      </div>
      
      {profile.expanded && (
        <div className="profile-content">
          <div className="profile-details">
            <div className="input-group">
              <label htmlFor={`researcher-name-${index}`}>Researcher Name</label>
              <input
                id={`researcher-name-${index}`}
                type="text"
                placeholder="Enter researcher name"
                value={profile.name}
                onChange={(e) => updateProfile(index, { ...profile, name: e.target.value })}
                className="input-field"
              />
            </div>
            
            <div className="input-group">
              <label htmlFor={`researcher-affiliation-${index}`}>Affiliation/Institution</label>
              <input
                id={`researcher-affiliation-${index}`}
                type="text"
                placeholder="Enter affiliation or institution"
                value={profile.affiliation}
                onChange={(e) => updateProfile(index, { ...profile, affiliation: e.target.value })}
                className="input-field"
              />
            </div>
            
            <div className="input-group">
              <label htmlFor={`researcher-area-${index}`}>Research Area</label>
              <select
                id={`researcher-area-${index}`}
                value={profile.researchArea}
                onChange={(e) => updateProfile(index, { ...profile, researchArea: e.target.value })}
                className="select-field"
              >
                <option value="">-- Select Research Area --</option>
                {researchAreas.map((area) => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="text-input-section">
            <textarea
              placeholder="Enter researcher profile information here..."
              value={profile.text}
              onChange={handleTextChange}
              className="text-area"
              rows="6"
            ></textarea>
          </div>
          
          {!isFirst && (
            <div className="remove-profile-container">
              <button 
                onClick={() => removeProfile(index)}
                className="remove-profile-button"
              >
                <span className="button-icon">
                  <CustomIcons.UserMinus />
                </span>
                Remove Researcher
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const MAX_RESEARCHERS = 10;

const HomePage = () => {
  const [profiles, setProfiles] = useState([{ ...initialResearcherProfile }]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const addResearcherProfile = () => {
    if (profiles.length < MAX_RESEARCHERS) {
      setProfiles([...profiles, { ...initialResearcherProfile }]);
    }
  };

  const removeResearcherProfile = (index) => {
    setProfiles(profiles.filter((_, i) => i !== index));
  };

  const updateResearcherProfile = (index, updatedProfile) => {
    const updatedProfiles = [...profiles];
    updatedProfiles[index] = updatedProfile;
    setProfiles(updatedProfiles);
  };

  // Function to call the extract_interests API
  const callExtractInterestsAPI = async (profiles) => {
    const apiData = profiles.map(profile => ({
      name: profile.name,
      description: profile.text
    }));

    const response = await fetch('http://127.0.0.1:5000/extract_interests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiData),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch research interests');
    }

    return await response.json();
  };

  const handleSubmit = async () => {
    // Check for empty required fields
    const hasEmptyRequiredFields = profiles.some(profile => {
      return !profile.name || !profile.affiliation || !profile.researchArea || !profile.text.trim();
    });

    if (hasEmptyRequiredFields) {
      alert('Please fill in all required fields for each researcher profile');
      return;
    }

    setIsLoading(true); // Show loading indicator

    try {
      const apiResponse = await callExtractInterestsAPI(profiles);
      navigate('/profiles', { state: { profiles: apiResponse } });
    } catch (error) {
      alert('Error extracting research interests. Please try again.');
      console.error(error);
    } finally {
      setIsLoading(false); // Hide loading indicator
    }
    
  };

  const hasValidData = profiles.some(profile => profile.text.trim() !== '');

  return (
    <div className="homepage">
      <div className="container">
        <div className="hero-section">
          <h1>NSF Research Team Formation</h1>
          <p>
            Add researcher profiles to form interdisciplinary teams and generate 
            competitive NSF research proposals using AI-powered analysis.
          </p>
        </div>

        <div className="main-card">
          <div className="profiles-container">
            <div className="profiles-header">
              <h2>Researcher Profiles</h2>
              <p className="profiles-count">
                {profiles.length} of {MAX_RESEARCHERS} researchers added
              </p>
            </div>
            
            <div className="profiles-list">
              {profiles.map((profile, index) => (
                <ResearcherProfile 
                  key={index}
                  profile={profile}
                  index={index}
                  updateProfile={updateResearcherProfile}
                  removeProfile={removeResearcherProfile}
                  isFirst={index === 0}
                  total={profiles.length}
                />
              ))}
            </div>
            
            <div className="add-profile-container">
              <button 
                onClick={addResearcherProfile}
                disabled={profiles.length >= MAX_RESEARCHERS}
                className={`add-profile-button ${profiles.length >= MAX_RESEARCHERS ? 'disabled' : ''}`}
              >
                <span className="button-icon">
                  <CustomIcons.UserPlus />
                </span>
                Add Researcher
              </button>
              {profiles.length >= MAX_RESEARCHERS && (
                <p className="max-limit-message">Maximum of 10 researchers reached</p>
              )}
            </div>
            
            <div className="submit-container">
              <button 
                onClick={handleSubmit}
                disabled={!hasValidData || isLoading}
                className={`submit-button ${!hasValidData || isLoading ? 'disabled' : ''}`}
              >
                {isLoading ? (
                  <span>
                    Processing... <span className="loading-spinner">⏳</span>
                  </span>
                ) : (
                  'Generate Research Teams & Proposals'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;