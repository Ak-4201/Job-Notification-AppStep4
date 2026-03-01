import { Link } from 'react-router-dom';

export default function TopBar() {
  return (
    <header className="top-bar">
      <div className="top-bar__section top-bar__section--left">
        <Link to="/" className="app-name">
          Job Notification Tracker
        </Link>
      </div>
      <div className="top-bar__section top-bar__section--center">
        <span className="progress-indicator">Premium</span>
      </div>
      <div className="top-bar__section top-bar__section--right">
        <span className="status-badge status-badge--idle">Idle</span>
      </div>
    </header>
  );
}
