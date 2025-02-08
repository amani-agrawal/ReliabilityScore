import React from "react";

const LoadingPage = () => {
  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p className="loading-text">Calculating reputation</p>
    </div>
  );
};

export default LoadingPage;
