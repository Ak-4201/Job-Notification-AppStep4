import { createContext, useContext, useCallback, useState } from 'react';

const STORAGE_KEY = 'job-notification-tracker-saved';
const PREFERENCES_KEY = 'jobTrackerPreferences';
const DIGEST_KEY_PREFIX = 'jobTrackerDigest_';
const STATUS_KEY = 'jobTrackerStatus';
const STATUS_UPDATES_KEY = 'jobTrackerStatusUpdates';

const DEFAULT_STATUS = 'Not Applied';
const STORED_STATUSES = ['Not Applied', 'Applied', 'Rejected', 'Selected'];
const MAX_STATUS_UPDATES = 50;

function getJobStatuses() {
  try {
    const raw = localStorage.getItem(STATUS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function getStatusUpdates() {
  try {
    const raw = localStorage.getItem(STATUS_UPDATES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function getSavedIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function getTodayKey() {
  const d = new Date();
  return (
    d.getFullYear() +
    '-' +
    String(d.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(d.getDate()).padStart(2, '0')
  );
}

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [savedIds, setSavedIdsState] = useState(() => getSavedIds());
  const [jobStatuses, setJobStatusesState] = useState(() => getJobStatuses());
  const [preferences, setPreferencesState] = useState(() => {
    try {
      const raw = localStorage.getItem(PREFERENCES_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const saveJob = useCallback((id) => {
    const ids = getSavedIds();
    if (ids.indexOf(id) === -1) {
      ids.push(id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
      setSavedIdsState(ids);
    }
  }, []);

  const removeSaved = useCallback((id) => {
    const ids = getSavedIds().filter((x) => x !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    setSavedIdsState(ids);
  }, []);

  const setPreferences = useCallback((prefs) => {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));
    setPreferencesState(prefs);
  }, []);

  const getDigestKey = useCallback(() => DIGEST_KEY_PREFIX + getTodayKey(), []);

  const loadDigest = useCallback(() => {
    try {
      const raw = localStorage.getItem(DIGEST_KEY_PREFIX + getTodayKey());
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const saveDigest = useCallback((list) => {
    localStorage.setItem(DIGEST_KEY_PREFIX + getTodayKey(), JSON.stringify(list));
  }, []);

  const getJobStatus = useCallback((jobId) => {
    const statuses = getJobStatuses();
    const s = statuses[jobId];
    if (!s || !STORED_STATUSES.includes(s)) return DEFAULT_STATUS;
    return s;
  }, []);

  const setJobStatus = useCallback((jobId, status, job = null) => {
    const safeStatus = STORED_STATUSES.includes(status) ? status : DEFAULT_STATUS;
    const statuses = getJobStatuses();
    statuses[jobId] = safeStatus;
    localStorage.setItem(STATUS_KEY, JSON.stringify(statuses));
    setJobStatusesState({ ...statuses });
    if (['Applied', 'Rejected', 'Selected'].includes(safeStatus) && job) {
      const updates = getStatusUpdates();
      const entry = {
        jobId,
        title: job.title || '',
        company: job.company || '',
        status: safeStatus,
        dateChanged: new Date().toISOString(),
      };
      const next = [entry, ...updates.filter((u) => u.jobId !== jobId)].slice(0, MAX_STATUS_UPDATES);
      localStorage.setItem(STATUS_UPDATES_KEY, JSON.stringify(next));
    }
  }, []);

  const loadStatusUpdates = useCallback(() => getStatusUpdates(), []);

  const value = {
    savedIds,
    saveJob,
    removeSaved,
    jobStatuses,
    getJobStatus,
    setJobStatus,
    loadStatusUpdates,
    preferences,
    setPreferences,
    getDigestKey,
    getTodayKey,
    loadDigest,
    saveDigest,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
