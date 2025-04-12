// src/pages/NotFoundPage.js
import React from 'react';
import './NotFoundPage.css'; // Optional: style the page

const NotFoundPage = () => {
  return (
    <div className="not-found-page">
      <h1>404</h1>
      <p>Oops! The page you're looking for doesn't exist.</p>
      <a href="/" className="back-home">← Go Back Home</a>
    </div>
  );
};

export default NotFoundPage;
