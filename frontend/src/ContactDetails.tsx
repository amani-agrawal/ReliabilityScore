import { useLocation } from "react-router-dom";
import ReactSpeedometer from "react-d3-speedometer";
import info from "./assets/information.png";
import { useState } from "react";
import video from './assets/socialgraph.mp4';

export default function Details() {
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

  const location = useLocation();
  const receivedData = location.state;
  
  const { calculation, simplePaths } = receivedData.paths || {};
  const targetAddress =
    simplePaths && simplePaths.length > 0 && simplePaths[0].path.length > 0
      ? simplePaths[0].path[simplePaths[0].path.length - 1]
      : "Unknown";

  const [showTooltip, setShowTooltip] = useState(false);

  const totalNodeLength = simplePaths.reduce(
    (sum: number, candidate: { node_length: number }) => sum + candidate.node_length,
    0
  );

  const walletAddressStyle = {
    wordBreak: "break-all" as const,
    overflowWrap: "break-word" as const,
    maxWidth: "100%",
    fontSize: "10px"
  };

  const scoreStyle = {
    fontSize: "10px", 
  };

  const titleStyle = {
    fontSize: "16px", 
  };

  const tooltipStyles: React.CSSProperties = {
    position: "absolute",
    top: "-30px",      // Move the tooltip 30px upward relative to its container
    right: "10px",     // Move the tooltip 10px from the right edge
    background: "rgba(0, 0, 0, 0.7)",
    color: "white",
    padding: "8px",
    borderRadius: "4px",
    zIndex: 10,
    whiteSpace: "nowrap",
  };

  const repScore = calculation ? calculation.percentageReputationScore : 0;
  const displayedScore = (calculation.gps >= 1 && repScore === 0) ? 100 : repScore;

  return (
    <div className="container" style={containerStyles}>
      <video autoPlay loop muted playsInline style={videoStyles}>
        <source src={video} type="video/mp4" />
      </video>
      <div className="card">
        <h1 style={titleStyle}>Target Wallet Address</h1>
        <div className="wallet-container">
          <h2 className="wallet-address" style={walletAddressStyle}>
            {targetAddress}
          </h2>
          <img
            src={info}
            alt="Info"
            className="info-image"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          />
          {showTooltip && (
            <div className="tooltip" style={tooltipStyles}>
              Reliability Score: Reliability of the wallet address to transact based on your previous transactions.
              <br />
              Unique Paths: The number of unique paths from your wallet to the target wallet.
              <br />
              Average Strength of Connections: How reliable each connection is.
            </div>
          )}
        </div>
        <hr className="divider" />
        <h2 className="score" style={scoreStyle}>
          Reputation Score: {calculation ? displayedScore.toFixed(2) : "N/A"}%
        </h2>
        <div className="speedometer">
          <ReactSpeedometer
            maxValue={100}
            value={calculation ? displayedScore : 0}
            needleColor="black"
            startColor="#9C67CD"
            endColor="#531E87"
            segments={5}
            textColor="#333"
            width={200}      
            height={160}
          />
        </div>
        <div className="stats-container">
          <p className="stat-item">
            <strong>Unique Paths:</strong> {calculation ? calculation.gps : "N/A"}
          </p>
          <p className="stat-item">
            <strong>Average Degree of Connection:</strong> {calculation ? (totalNodeLength / calculation.gps).toFixed(2) : "N/A"}
          </p>
        </div>
      </div>
    </div>
  );
}
