import React from 'react';
import './AboutPage.css';
import sampleProfile from '../../assets/applogo.png'; // Make sure this image exists

const creators = [
  {
    name: 'Sample Name',
    role: 'Full Stack Developer & AI Engineer',
    image: sampleProfile,
  },
  {
    name: 'Sample Name',
    role: 'UI/UX Designer',
    image: sampleProfile,
  },
];

const AboutPage = () => {
  return (
    <div className="about-page">
      <div className="about-container">
        <h1 className="about-title">About ResearchConnect</h1>
        <p className="about-description">
          ResearchConnect is an AI-powered platform that enables researchers to collaborate efficiently, form interdisciplinary teams, and generate high-quality NSF proposals.
          The platform uses intelligent profile extraction, topic modeling, and team matching algorithms to streamline research collaboration.
        </p>

        <h2 className="section-heading">Meet the Creators</h2>
        <div className="creator-profiles">
          {creators.map((creator, index) => (
            <div key={index} className="creator-card">
              <img src={creator.image} alt={creator.name} className="creator-image" />
              <h3>{creator.name}</h3>
              <p>{creator.role}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
