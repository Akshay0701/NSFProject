import React from 'react';
import UserMinusIcon from '../../assets/icons/UserMinusIcon';
import { researchAreas } from '../../utils/constants';
import './ResearcherProfile.css';

const ResearcherProfile = ({
  profile,
  index,
  updateProfile,
  removeProfile,
  isFirst,
  total,
}) => {
  const toggleExpanded = () => {
    updateProfile(index, { ...profile, expanded: !profile.expanded });
  };

  const handleTextChange = (e) => {
    updateProfile(index, { ...profile, text: e.target.value, pdfFile: null });
  };

  const handlePDFUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      updateProfile(index, { ...profile, pdfFile: file, text: '' });
    } else {
      alert('Please upload a valid PDF file');
    }
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
                onChange={(e) =>
                  updateProfile(index, { ...profile, name: e.target.value })
                }
                className="input-field"
              />
            </div>

            <div className="input-group">
              <label htmlFor={`researcher-affiliation-${index}`}>
                Affiliation/Institution
              </label>
              <input
                id={`researcher-affiliation-${index}`}
                type="text"
                placeholder="Enter affiliation or institution"
                value={profile.affiliation}
                onChange={(e) =>
                  updateProfile(index, { ...profile, affiliation: e.target.value })
                }
                className="input-field"
              />
            </div>

            <div className="input-group">
              <label htmlFor={`researcher-area-${index}`}>Research Area</label>
              <select
                id={`researcher-area-${index}`}
                value={profile.researchArea}
                onChange={(e) =>
                  updateProfile(index, { ...profile, researchArea: e.target.value })
                }
                className="select-field"
              >
                <option value="">-- Select Research Area --</option>
                {researchAreas.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="input-method-toggle">
            <button
              className={`toggle-option ${profile.inputMethod === 'text' ? 'active' : ''}`}
              onClick={() =>
                updateProfile(index, { ...profile, inputMethod: 'text' })
              }
            >
              Enter Text
            </button>
            <button
              className={`toggle-option ${profile.inputMethod === 'pdf' ? 'active' : ''}`}
              onClick={() =>
                updateProfile(index, { ...profile, inputMethod: 'pdf' })
              }
            >
              Upload PDF
            </button>
          </div>

          {profile.inputMethod === 'text' ? (
            <div className="text-input-section">
              <textarea
                placeholder="Enter researcher profile information here..."
                value={profile.text}
                onChange={handleTextChange}
                className="text-area"
                rows="6"
              />
            </div>
          ) : (
            <div className="pdf-upload-section">
              {profile.isProcessingPDF && (
                <div className="loading-indicator">
                  <span className="loading-spinner" /> Processing PDF...
                </div>
              )}
              <label htmlFor={`pdf-upload-${index}`}>Upload PDF</label>
              <input
                id={`pdf-upload-${index}`}
                type="file"
                accept=".pdf"
                onChange={handlePDFUpload}
              />
              {profile.pdfFile && (
                <p className="pdf-filename">Selected: {profile.pdfFile.name}</p>
              )}
              {profile.text && (
                <div className="pdf-preview-text">
                  <h4>Extracted Text Preview:</h4>
                  <p>
                    {profile.text.length > 200
                      ? `${profile.text.substring(0, 200)}...`
                      : profile.text}
                  </p>
                </div>
              )}
            </div>
          )}

          {!isFirst && (
            <div className="remove-profile-container">
              <button
                onClick={() => removeProfile(index)}
                className="remove-profile-button"
              >
                <span className="button-icon">
                  <UserMinusIcon />
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

export default ResearcherProfile;