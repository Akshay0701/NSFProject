// src/components/NSFSolicitationUploadCard.jsx
import React from 'react';
import EditIcon from '../../assets/icons/EditIcon';
import useNSFSolicitation from '../../hooks/useNSFSolicitation';
import './NSFSolicitationUploadCard.css';

const NSFSolicitationUploadCard = () => {
  const {
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
  } = useNSFSolicitation();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFileUpload(file);
  };

  return (
    <div className="nsf-solicitation-card">
      <div className="card-header">
        <h3>NSF Solicitation</h3>
        <div className="action-icons">
          {!isEditing ? (
            <button className="edit-btn" title="Edit Keywords" onClick={() => setIsEditing(true)}>
              <EditIcon />
            </button>
          ) : (
            <>
              <button className="edit-btn" onClick={saveKeywords}>Save</button>
              <button className="edit-btn" onClick={cancelEdit}>Cancel</button>
            </>
          )}
        </div>
      </div>

      <div className="card-body">
        <div className="nsf-solicitation-content">
        <div className="upload-box" onClick={triggerFileUpload}>
          <div className="upload-content">
            {isUploadingPDF ? (
              <>
                <div className="upload-spinner"></div>
                <p className="upload-label">Uploading...</p>
              </>
            ) : (
              <>
                <div className="upload-plus">+</div>
                <p className="upload-label">Upload PDF</p>
              </>
            )}
          </div>
          <input
            type="file"
            accept="application/pdf"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </div>

          <div className="keyword-tags-scrollable">
            {isEditing ? (
              <div className="editable-tags">
                {editedKeywords.map((tag, idx) => (
                  <span key={idx} className="topic-tag editable">
                    {tag}
                    <button onClick={() => removeKeyword(tag)}>×</button>
                  </span>
                ))}
                <input
                  className="topic-input"
                  type="text"
                  placeholder="Add keyword"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addKeyword()}
                />
              </div>
            ) : (
              keywords.length > 0 ? (
                keywords.map((tag, idx) => (
                  <span key={idx} className="topic-tag">{tag}</span>
                ))
              ) : (
                <p className="no-topics">No keywords extracted yet</p>
              )
            )}
          </div>
        </div>

        {error && <p style={{ color: 'red', marginTop: '0.5rem' }}>{error}</p>}
      </div>
    </div>
  );
};

export default NSFSolicitationUploadCard;
