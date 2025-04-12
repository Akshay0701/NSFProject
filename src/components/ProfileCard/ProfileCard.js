import React from 'react';
import './ProfileCard.css'; // optional: split out styles if needed

const ProfileCard = ({ profile }) => {
  return (
    <div className="profile-card">
      <div className="card-header">
        <h3>{profile.name}</h3>
      </div>
      <div className="card-body">
        <h4 className="section-title">Research Topics:</h4>
        {profile.research_topics?.length > 0 ? (
          <div className="topics-container">
            {profile.research_topics.map((topic, i) => (
              <span key={i} className="topic-tag">{topic}</span>
            ))}
          </div>
        ) : (
          <p className="no-topics">No topics extracted</p>
        )}
      </div>
    </div>
  );
};

export default ProfileCard;
