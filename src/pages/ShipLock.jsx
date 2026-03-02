import { useTestChecklist } from '../context/TestChecklistContext';
import { Link } from 'react-router-dom';

export default function ShipLock() {
  const { getAllPassed } = useTestChecklist();
  const allPassed = getAllPassed();

  if (!allPassed) {
    return (
      <div className="ship-lock">
        <div className="ship-lock__message">
          Complete all tests before shipping.
        </div>
        <p className="ship-lock__hint">
          Go to <Link to="/jt/07-test">/jt/07-test</Link> to complete the checklist.
        </p>
      </div>
    );
  }

  return (
    <div className="ship-lock ship-lock--unlocked">
      <div className="ship-lock__message ship-lock__message--success">
        All tests passed. Ready to ship.
      </div>
    </div>
  );
}
