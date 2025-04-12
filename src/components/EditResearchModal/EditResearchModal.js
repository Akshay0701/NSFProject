// components/EditResearchModal.js
import React, { useState } from 'react';
import './EditResearchModal.css';

const EditResearchModal = ({ profile, onClose, onSave }) => {
  const [topics, setTopics] = useState(profile.research_topics || []);
  const [newTopic, setNewTopic] = useState('');

  const handleAddTopic = () => {
    if (newTopic && !topics.includes(newTopic)) {
      setTopics([...topics, newTopic]);
      setNewTopic('');
    }
  };

  const handleDeleteTopic = (topicToDelete) => {
    setTopics(topics.filter(t => t !== topicToDelete));
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Edit Research Topics</h2>
        <p><strong>Name:</strong> {profile.name}</p>
        <p><strong>Email:</strong> {profile.email}</p>

        <div className="topic-editor">
          <div className="current-topics">
            {topics.map((topic, index) => (
              <div key={index} className="topic-chip">
                {topic}
                <button onClick={() => handleDeleteTopic(topic)}>×</button>
              </div>
            ))}
          </div>
          <div className="topic-input">
            <input
              type="text"
              placeholder="Add new topic"
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
            />
            <button onClick={handleAddTopic}>Add</button>
          </div>
        </div>

        <div className="modal-actions">
          <button className="secondary-button" onClick={onClose}>Cancel</button>
          <button className="primary-button" onClick={() => onSave(topics)}>Update</button>
        </div>
      </div>
    </div>
  );
};

export default EditResearchModal;
