import React from 'react';
import './ProposalCard.css';

const ProposalCard = ({ proposal, index }) => {
  return (
    <div className="proposal-card">
      <div className="proposal-header">
        <span className="proposal-number">Proposal #{index + 1}</span>
      </div>
      <p className="proposal-text">{proposal}</p>
    </div>
  );
};

export default ProposalCard;