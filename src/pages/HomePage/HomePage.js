import React from 'react';
import ResearcherProfile from '../../components/ResearcherProfile';
import useProfileStore from '../../store/profileStore';
import useExtractInterests from '../../hooks/useExtractInterests';
import UserPlusIcon from '../../assets/icons/UserPlusIcon';
import { MAX_RESEARCHERS } from '../../utils/constants';
import './HomePage.css';

const HomePage = () => {
  const { profiles, addProfile, removeProfile, updateProfile } =
    useProfileStore();
  const { extractInterests, isLoading } = useExtractInterests();

  const handleSubmit = async () => {
    const hasEmptyRequiredFields = profiles.some(
      (profile) =>
        !profile.name ||
        !profile.affiliation ||
        !profile.researchArea ||
        (!profile.text.trim() && !profile.pdfFile)
    );

    if (hasEmptyRequiredFields) {
      alert(
        'Please fill in all required fields and provide either text or a PDF for each researcher profile'
      );
      return;
    }

    await extractInterests(profiles);
  };

  const hasValidData = profiles.some(
    (profile) => profile.text.trim() !== '' || profile.pdfFile
  );

  return (
    <div className="homepage">
      <div className="container">
        <div className="hero-section">
          <div className="hero-content">
            <h1>NSF Research Team Formation</h1>
            <p>
              Add researcher profiles to form interdisciplinary teams and generate
              competitive NSF research proposals using AI-powered analysis.
            </p>
          </div>
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
                  updateProfile={updateProfile}
                  removeProfile={removeProfile}
                  isFirst={index === 0}
                  total={profiles.length}
                />
              ))}
            </div>

            <div className="add-profile-container">
              <button
                onClick={addProfile}
                disabled={profiles.length >= MAX_RESEARCHERS}
                className={`add-profile-button ${
                  profiles.length >= MAX_RESEARCHERS ? 'disabled' : ''
                }`}
              >
                <span className="button-icon">
                  <UserPlusIcon />
                </span>
                Add Researcher
              </button>
              {profiles.length >= MAX_RESEARCHERS && (
                <p className="max-limit-message">
                  Maximum of 10 researchers reached
                </p>
              )}
            </div>

            <div className="submit-container">
              <button
                onClick={handleSubmit}
                disabled={!hasValidData || isLoading}
                className={`submit-button ${
                  !hasValidData || isLoading ? 'disabled' : ''
                }`}
              >
                {isLoading ? (
                  <span>
                    <span className="loading-spinner" /> Processing...
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