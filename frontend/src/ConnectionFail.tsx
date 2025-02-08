import React from "react";
import video from './assets/socialgraph.mp4';

const NoConnection = () => {
  return (
    <div>
      <video autoPlay loop muted className="bgvideo">
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
