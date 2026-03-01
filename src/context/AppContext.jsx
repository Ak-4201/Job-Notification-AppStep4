import { createContext, useContext, useCallback, useState, useEffect } from 'react';

const STORAGE_KEY = 'job-notification-tracker-saved';
const PREFERENCES_KEY = 'jobTrackerPreferences';
const DIGEST_KEY_PREFIX = 'jobTrackerDigest_';

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

  const value = {
    savedIds,
    saveJob,
    removeSaved,
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
