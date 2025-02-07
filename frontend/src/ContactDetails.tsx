import { Link as L} from 'react-router-dom';
import placeholder from './placeholder.png';

export default function Details() {
  return (
    <div className="container">
      {/* Left box: Smaller Text Message Box with Name and Image */}
      <div className="left-box">
        <div className="profile-card">
          <img
            src= {placeholder}
            alt="Profile"
            className="profile-image"
          />
          <h2 className="profile-name">John Doe</h2>
        </div>
      </div>

      {/* Right box: Information and Stats */}
      <div className="right-box">

        <h3 className="section-title">Statistics</h3>
        <ul className="info-list">
          <li><strong>Reliability Score:</strong> 50</li>
          <li><strong>Number of transactions:</strong> 350</li>
          <li><strong>Number of fraudulent transactions :</strong> 150</li>
        </ul>
      </div>
    </div>
    );
}
