import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="route-placeholder">
      <h2 className="route-placeholder__title">Stop Missing The Right Jobs.</h2>
      <p className="route-placeholder__subtitle">
        Precision-matched job discovery delivered daily at 9AM.
      </p>
      <div className="route-placeholder__actions">
        <Link to="/settings" className="btn btn--primary js-start-tracking">
          Start Tracking
        </Link>
      </div>
    </div>
  );
}
