import { useTestChecklist, TEST_ITEMS } from '../context/TestChecklistContext';

export default function TestChecklist() {
  const { status, toggle, getPassedCount, getAllPassed, reset } = useTestChecklist();
  const passed = getPassedCount();

  const handleReset = () => {
    reset();
  };

  return (
    <div className="test-checklist">
      <div className="test-checklist__summary">
        <span className="test-checklist__count">
          Tests Passed: {passed} / 10
        </span>
        {passed < 10 && (
          <p className="test-checklist__warning">
            Resolve all issues before shipping.
          </p>
        )}
      </div>
      <div className="test-checklist__actions">
        <button
          type="button"
          className="btn btn--secondary btn--sm"
          onClick={handleReset}
        >
          Reset Test Status
        </button>
      </div>
      <ul className="test-checklist__list">
        {TEST_ITEMS.map((item) => (
          <li key={item.id} className="test-checklist__item">
            <label className="test-checklist__label">
              <input
                type="checkbox"
                checked={!!status[item.id]}
                onChange={() => toggle(item.id)}
                className="test-checklist__checkbox"
              />
              <span className="test-checklist__text">{item.label}</span>
              {item.tooltip && (
                <span className="test-checklist__tooltip" title={item.tooltip}>
                  ?
                </span>
              )}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
