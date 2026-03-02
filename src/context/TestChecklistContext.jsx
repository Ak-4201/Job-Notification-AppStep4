import { createContext, useContext, useCallback, useState } from 'react';

const STORAGE_KEY = 'jobTrackerTestStatus';

export const TEST_ITEMS = [
  { id: 'preferences-persist', label: 'Preferences persist after refresh', tooltip: 'Save in Settings, refresh page, confirm values remain.' },
  { id: 'match-score-correct', label: 'Match score calculates correctly', tooltip: 'Check digest jobs show match % in expected range (65–99).' },
  { id: 'show-only-matches-toggle', label: '"Show only matches" toggle works', tooltip: 'If available, toggle and verify filtered results.' },
  { id: 'save-job-persists', label: 'Save job persists after refresh', tooltip: 'Save a job, refresh, confirm it appears in Saved.' },
  { id: 'apply-opens-new-tab', label: 'Apply opens in new tab', tooltip: 'Click Apply, verify target opens in new tab.' },
  { id: 'status-update-persists', label: 'Status update persists after refresh', tooltip: 'Change job status, refresh, confirm status remains.' },
  { id: 'status-filter-works', label: 'Status filter works correctly', tooltip: 'Filter by Applied/Rejected/Selected, verify correct jobs show.' },
  { id: 'digest-generates-top10', label: 'Digest generates top 10 by score', tooltip: 'Generate digest, confirm 10 jobs ranked by match score.' },
  { id: 'digest-persists-day', label: 'Digest persists for the day', tooltip: 'Generate digest, refresh, confirm it still shows.' },
  { id: 'no-console-errors', label: 'No console errors on main pages', tooltip: 'Navigate Dashboard, Saved, Digest, Settings; check DevTools console.' },
];

function loadTestStatus() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function saveTestStatus(obj) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
  } catch {
    // ignore
  }
}

const TestChecklistContext = createContext(null);

export function TestChecklistProvider({ children }) {
  const [status, setStatusState] = useState(() => loadTestStatus());

  const setChecked = useCallback((id, checked) => {
    const s = loadTestStatus();
    if (checked) {
      s[id] = true;
    } else {
      delete s[id];
    }
    saveTestStatus(s);
    setStatusState({ ...s });
  }, []);

  const toggle = useCallback((id) => {
    const s = loadTestStatus();
    s[id] = !s[id];
    saveTestStatus(s);
    setStatusState({ ...s });
  }, []);

  const getPassedCount = useCallback(() => {
    const s = loadTestStatus();
    return TEST_ITEMS.filter((item) => s[item.id]).length;
  }, []);

  const getAllPassed = useCallback(() => {
    const s = loadTestStatus();
    return TEST_ITEMS.every((item) => s[item.id]);
  }, []);

  const reset = useCallback(() => {
    saveTestStatus({});
    setStatusState({});
  }, []);

  const value = {
    status,
    isChecked: (id) => !!status[id],
    setChecked,
    toggle,
    getPassedCount: () => TEST_ITEMS.filter((item) => status[item.id]).length,
    getAllPassed: () => TEST_ITEMS.every((item) => status[item.id]),
    reset,
  };

  return (
    <TestChecklistContext.Provider value={value}>
      {children}
    </TestChecklistContext.Provider>
  );
}

export function useTestChecklist() {
  const ctx = useContext(TestChecklistContext);
  if (!ctx) throw new Error('useTestChecklist must be used within TestChecklistProvider');
  return ctx;
}
