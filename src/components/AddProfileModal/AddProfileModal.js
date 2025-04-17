import React from 'react';
import './AddProfileModal.css'

const AddProfileModal = ({
  addProfileText,
  formData,
  inputMethod,
  setInputMethod,
  handleInputChange,
  handleAddProfile,
  setShowModal
}) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{addProfileText}</h2>
          <button className="close-button" onClick={() => setShowModal(false)}>&times;</button>
        </div>

        {/* Input method selection */}
        <div className="input-method-toggle">
          <button
            type="button"
            className={`toggle-option ${inputMethod === 'description' ? 'active' : ''}`}
            onClick={() => setInputMethod('description')}
          >
            Text Description
          </button>
          <button
            type="button"
            className={`toggle-option ${inputMethod === 'pdf' ? 'active' : ''}`}
            onClick={() => setInputMethod('pdf')}
          >
            Upload PDF
          </button>
          <button
            type="button"
            className={`toggle-option ${inputMethod === 'link' ? 'active' : ''}`}
            onClick={() => setInputMethod('link')}
          >
            Add Link
          </button>
        </div>

        <form onSubmit={handleAddProfile} className="modal-form">
          {/* Name */}
          <div className="form-group">
            <label>Name</label>
            <input
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Email */}
          <div className="form-group">
            <label>Email</label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Description / PDF / Link input */}
          {inputMethod === 'description' && (
            <div className="form-group">
              <label>Research Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="5"
                placeholder="Write research background, interests, etc."
              />
            </div>
          )}

          {inputMethod === 'pdf' && (
            <div className="form-group">
              <label>Upload PDF</label>
              <input
                name="pdfFile"
                type="file"
                accept="application/pdf"
                onChange={handleInputChange}
              />
            </div>
          )}

          {inputMethod === 'link' && (
            <div className="form-group">
              <label>Website URL</label>
              <input
                name="websiteLink"
                type="url"
                placeholder="https://example.com/researcher"
                value={formData.websiteLink || ''}
                onChange={handleInputChange}
                required
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="form-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>
            <button type="submit" className="primary-button">
              {addProfileText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProfileModal;
