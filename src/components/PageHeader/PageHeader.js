import React, { useState } from 'react';
import './PageHeader.css';

const PageHeader = ({ title, subtitle, actions, showCopyButton = false }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyRoomID = () => {
    const roomID = title.split(': ')[1];
    navigator.clipboard.writeText(roomID).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className="room-header">
      <div className="header-content">
        <div className="room-info">
          <div className="room-id-copy">
            <h1>{title}</h1>
            {showCopyButton && (
              <button className="copy-button" onClick={handleCopyRoomID} title="Copy Room ID">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="feather feather-copy"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </button>
            )}
          </div>
          {subtitle && <p className="creator-info">{subtitle}</p>}
        </div>
        <div className="header-actions">{actions}</div>
      </div>
    </div>
  );
};

export default PageHeader;
