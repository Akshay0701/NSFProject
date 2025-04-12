import React from 'react';

const PageHeader = ({ title, subtitle, actions }) => {
  return (
    <div className="room-header">
      <div className="header-content">
        <div className="room-info">
          <h1>{title}</h1>
          {subtitle && <p className="creator-info">{subtitle}</p>}
        </div>
        <div className="header-actions">{actions}</div>
      </div>
    </div>
  );
};

export default PageHeader;
