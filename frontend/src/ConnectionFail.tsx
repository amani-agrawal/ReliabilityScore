import React from "react";
import video from './assets/socialgraph.mp4';

const NoConnection = () => {
  const videoStyles: React.CSSProperties = {
    position: "fixed",         // Fix the video relative to the viewport
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",        // Ensure the video covers the viewport without distortion
    filter: "blur(8px)",       // Apply a blur effect
    pointerEvents: "none",     // Disable mouse/touch interactions with the video
    zIndex: -100               // Push the video far behind all other content
  };

  const containerStyles: React.CSSProperties = {
    position: "relative",      // Establish a new stacking context
    zIndex: 1,                 // Make sure this container is above the video
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",  // Center vertically
    alignItems: "center",      // Center horizontally
    width: "100vw",            // Full viewport width
    height: "100vh",           // Full viewport height
    margin: 0,
    padding: 0,
    textAlign: "center",
    color: "black"             // Example text color
  };

  return (
    <div style={containerStyles}>
       <video autoPlay loop muted playsInline style={videoStyles}>
        <source src={video} type="video/mp4" />
      </video>
    <div className="container">
      <div className="card">
      <p className="no-connection-text">
        No connection found!<span className="sad-face">😞</span>
      </p>
      <p className="no-connection-text">
        Try transacting with more people.
      </p>
      </div>
    </div>
    </div>
  );
};

export default NoConnection;
