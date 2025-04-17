import React, { useRef } from 'react';
import PageHeader from '../../components/PageHeader'; 
import './PreviouslyFundedProjectPage.css';
import TrashIcon from '../../assets/icons/TrashIcon';
import EditIcon from '../../assets/icons/EditIcon';
import usePreviouslyFundedProjects from '../../hooks/usePreviouslyFundedProjects';

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
    // Clear previous errors when trying to upload again
    setError(null);
    fileInputRef.current?.click();
  };

  return (
    <div className="previously-funded-page">
      <PageHeader
        title="Previously Funded Projects"
        subtitle="Manage project abstracts loaded from CSV or added manually."
        actions={
          <>
            {/* Hidden file input */}
            <input
                type="file"
                accept=".csv, .xlsx, .xls"
                onChange={handleFileChange}
                ref={fileInputRef}
                style={{ display: 'none' }}
                disabled={isLoading}
                />

            {/* Button to trigger file input */}
            <button
              className="primary-button"
              onClick={handleAddCsvClick}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : '+ Add via CSV'}
            </button>
          </>
        }
      />

       {error && (
        <div className="error-message-bar">
          <p>Error: {error}</p>
          <button onClick={() => setError(null)}>&times;</button>
        </div>
      )}

      <div className="content-container-funded">
        {projects.length > 0 ? (
          <>
            <div className="table-container">
              <table className="projects-table">
                <thead>
                  <tr>
                    <th className="col-number">No.</th>
                    <th className="col-abstract">Abstract</th>
                    <th className="col-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project, index) => (
                    <tr key={project.id}>
                      <td className="col-number">{index + 1}</td>
                      <td className="col-abstract abstract-cell">
                        {editingProjectId === project.id ? (
                          <textarea
                            className="edit-textarea"
                            value={editedAbstract}
                            onChange={handleEditInputChange}
                            rows={5} // Adjust as needed
                          />
                        ) : (
                          <p>{project.abstract || <i>No abstract provided</i>}</p>
                        )}
                      </td>
                      <td className="col-actions action-cell">
                        {editingProjectId === project.id ? (
                          <>
                            <button onClick={saveEdit} className="action-button save-button" title="Save Changes">
                              ✓
                            </button>
                            <button onClick={cancelEditing} className="action-button cancel-button" title="Cancel Edit">
                              ✕
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => startEditing(project)} className="action-button edit-button" title="Edit Abstract">
                              <EditIcon />
                            </button>
                            <button onClick={() => deleteProject(project.id)} className="action-button delete-button" title="Delete Project">
                              <TrashIcon />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Add Project button appears after the table if there are items */}
            <div className="add-project-row-button-container">
                 <button
                    className="secondary-button add-project-button"
                    onClick={addProject}
                    disabled={isLoading}
                  >
                    + Add New Project Row
                  </button>
            </div>
          </>
        ) : (
          <div className="empty-state-funded">
            {isLoading ? (
                <>
                    <div className="loading-spinner"></div>
                    <p>Processing file...</p>
                </>
            ) : (
                <>
                    <div className="empty-icon">📄</div>
                    <h3>No Projects Added Yet</h3>
                    <p>Upload a CSV file or add projects manually to get started.</p>
                    <button
                        className="primary-button"
                        onClick={addProject} // Add first empty project
                        disabled={isLoading}
                        style={{marginTop: '1rem'}}
                    >
                        + Add First Project
                    </button>
                </>
            )}
          </div>
        )}

        {/* Save All Button */}
        {projects.length > 0 && (
            <div className="save-all-container">
                <button
                    className="generate-button save-projects-button" // Reusing generate-button style
                    onClick={saveAllProjects}
                    disabled={isLoading || editingProjectId !== null} // Disable if loading or editing
                >
                    {isLoading ? 'Saving...' : 'Save All Projects'}
                </button>
                {editingProjectId !== null && <span className='save-disabled-reason'>(Finish editing to save)</span>}
            </div>
         )}
      </div>
    </div>
  );
};

export default PreviouslyFundedProjectPage;