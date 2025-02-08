import { useLocation } from "react-router-dom";
import ReactSpeedometer from "react-d3-speedometer";
import video from './assets/socialgraph.mp4';
import info from './assets/information.png';
import { useState } from "react";

export default function Details() {
  const location = useLocation();
  const receivedData = location.state;
  const [showTooltip, setShowTooltip] = useState(false);


  return (
    <div className="container">
      <video autoPlay loop muted className="bgvideo">
        <source src={video} type="video/mp4" />
      </video>

      <div className="card">
      <div className="wallet-container">
      <h1 className="wallet-address">{receivedData.address}</h1>
          <img
            src={info}
            alt="Info"
            className="info-image"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          />

          {showTooltip && (
            <div className="tooltip">
             Reliability Score: Reliability of the below wallet address to transact based on your previous transactions.  <br />
              Unique Paths: The number of paths can be made from you to the given wallet address.  <br />
              Average Strength of connections: How reliable was each connection between you and the wallet address. 
            </div>
          )}
        </div>

        <hr className="divider" />
        <h2 className="score">Reliability Score: {receivedData.score}</h2>


        <div className="speedometer">
          <ReactSpeedometer
            maxValue={100}
            value={receivedData.score}
            needleColor="black"
            startColor="red"
            endColor="green"
            segments={5}
            textColor="#333"
          />
        </div>

        <div className="stats-container">
          <p className="stat-item"><strong>Unique Paths:</strong> {receivedData.uniquePaths}</p>
          <p className="stat-item"><strong>Average Strength of Connections:</strong> {receivedData.strength}%</p>
        </div>
      </div>
    </div>
  );
}
