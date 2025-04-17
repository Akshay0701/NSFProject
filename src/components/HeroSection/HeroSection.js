import React from 'react';
import logo from '../../assets/applogo.png'; // Adjust the path as needed
import './HeroSection.css'

const HeroSection = () => (
  <div className="intro-hero">
    <div className="hero-content">
      <h1>Welcome to <span>ResearchConnect</span></h1>
      <p className="hero-subtitle">
        Build interdisciplinary research teams and generate impactful project proposals with AI-powered collaboration.
      </p>
    </div>
    <div className="hero-image">
      <img src={logo} alt="ResearchConnect Logo" className="app-logo" />
    </div>
  </div>
);


export default HeroSection;
