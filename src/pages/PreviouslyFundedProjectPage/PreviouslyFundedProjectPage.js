import React, { useRef } from 'react';
import PageHeader from '../../components/PageHeader'; 
import './PreviouslyFundedProjectPage.css';
import usePreviouslyFundedProjects from '../../hooks/usePreviouslyFundedProjects';

import { 
  FiSave as SaveIcon,
  FiX as CancelIcon,
  FiPlus as PlusIcon,
  FiUpload as UploadIcon,
  FiEdit2 as EditIcon,
  FiTrash2 as TrashIcon,
  FiFileText as PageIcon
} from 'react-icons/fi';

const PreviouslyFundedProjectPage = () => {
  const {
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
    saveAllProjects,
    setError
  } = usePreviouslyFundedProjects();

  const fileInputRef = useRef(null);

  const handleAddCsvClick = () => {
    setError(null);
    fileInputRef.current?.click();
  };

  return (
    <div className="previously-funded-page">
      <PageHeader
        title="Previously Funded Projects"
        subtitle="Manage project abstracts loaded from CSV or added manually."
        actions={
          <div className="header-actions">
            <input
              type="file"
              accept=".csv, .xlsx, .xls"
              onChange={handleFileChange}
              ref={fileInputRef}
              style={{ display: 'none' }}
              disabled={isLoading}
            />
            <button
              className="primary-button"
              onClick={handleAddCsvClick}
              disabled={isLoading}
            >
              <UploadIcon />
              {isLoading ? 'Processing...' : 'Upload CSV'}
            </button>
            <button
              className="secondary-button"
              onClick={addProject}
              disabled={isLoading}
            >
              <PlusIcon />
              Add Project
            </button>
          </div>
        }
      />

      {error && (
        <div className="alert alert-error">
          <p>{error}</p>
          <button onClick={() => setError(null)}>&times;</button>
        </div>
      )}

      <div className="content-container">
        {projects.length > 0 ? (
          <div className="card">
            <div className="table-responsive">
              <table className="projects-table">
                <thead>
                  <tr>
                    <th className="col-number">#</th>
                    <th className="col-abstract">Abstract</th>
                    <th className="col-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project, index) => (
                    <tr key={project.id} className={editingProjectId === project.id ? 'editing' : ''}>
                      <td className="col-number">{index + 1}</td>
                      <td className="col-abstract">
                        {editingProjectId === project.id ? (
                          <textarea
                            className="form-textarea"
                            value={editedAbstract}
                            onChange={handleEditInputChange}
                            rows={5}
                            autoFocus
                          />
                        ) : (
                          <div className="abstract-content">
                            {project.abstract || <span className="text-muted">No abstract provided</span>}
                          </div>
                        )}
                      </td>
                      <td className="col-actions">
                        <div className="action-buttons">
                          {editingProjectId === project.id ? (
                            <>
                              <button 
                                onClick={saveEdit} 
                                className="btn-action btn-save"
                                title="Save Changes"
                              >
                                <SaveIcon />
                              </button>
                              <button 
                                onClick={cancelEditing} 
                                className="btn-action btn-cancel"
                                title="Cancel"
                              >
                                <CancelIcon />
                              </button>
                            </>
                          ) : (
                            <>
                              <button 
                                onClick={() => startEditing(project)} 
                                className="btn-action btn-edit"
                                title="Edit"
                              >
                                <EditIcon />
                              </button>
                              <button 
                                onClick={() => deleteProject(project.id)} 
                                className="btn-action btn-delete"
                                title="Delete"
                              >
                                <TrashIcon />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card-footer">
              <button
                className="primary-button"
                onClick={saveAllProjects}
                disabled={isLoading || editingProjectId !== null}
              >
                {isLoading ? (
                  <>
                    Saving...
                  </>
                ) : (
                  'Save All Projects'
                )}
              </button>
              {editingProjectId !== null && (
                <p className="save-notice">
                  Finish editing current project to save all changes
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="empty-state">
            {isLoading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Processing your file...</p>
              </div>
            ) : (
              <>
                <div className="empty-icon">
                  <PageIcon />
                </div>
                <h3>No Projects Added Yet</h3>
                <p>Upload a CSV file or add projects manually to get started</p>
                <div className="empty-actions">
                  <button
                    className="btn btn-primary"
                    onClick={handleAddCsvClick}
                  >
                    <UploadIcon />
                    Upload CSV
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={addProject}
                  >
                    <PlusIcon />
                    Add Project
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviouslyFundedProjectPage;