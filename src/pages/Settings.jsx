import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export default function Settings() {
  const { preferences, setPreferences } = useApp();
  const [roleKeywords, setRoleKeywords] = useState('');
  const [locations, setLocations] = useState('');
  const [mode, setMode] = useState('');
  const [experience, setExperience] = useState('');

  useEffect(() => {
    if (preferences) {
      setRoleKeywords(preferences.roleKeywords || '');
      setLocations(preferences.locations || '');
      setMode(preferences.mode || '');
      setExperience(preferences.experience || '');
    }
  }, [preferences]);

  const handleSave = () => {
    setPreferences({
      roleKeywords,
      locations,
      mode,
      experience,
    });
  };

  return (
    <div className="route-placeholder">
      <h2 className="route-placeholder__title">Settings</h2>
      <p className="route-placeholder__subtitle">
        Set up role keywords, locations, and preferences.
      </p>
      <div className="settings-placeholder">
        <div className="form-row">
          <div className="field">
            <label className="field__label" htmlFor="settings-role-keywords">
              Role keywords
            </label>
            <input
              id="settings-role-keywords"
              type="text"
              className="field__control"
              placeholder="e.g. React, Python, Data Analyst"
              value={roleKeywords}
              onChange={(e) => setRoleKeywords(e.target.value)}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="field">
            <label
              className="field__label"
              htmlFor="settings-preferred-locations"
            >
              Preferred locations
            </label>
            <input
              id="settings-preferred-locations"
              type="text"
              className="field__control"
              placeholder="e.g. Bengaluru, Remote"
              value={locations}
              onChange={(e) => setLocations(e.target.value)}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="field">
            <label className="field__label" htmlFor="settings-mode">
              Mode
            </label>
            <select
              id="settings-mode"
              className="field__control"
              value={mode}
              onChange={(e) => setMode(e.target.value)}
            >
              <option value="">Any</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Onsite">Onsite</option>
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="field">
            <label className="field__label" htmlFor="settings-experience">
              Experience level
            </label>
            <select
              id="settings-experience"
              className="field__control"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
            >
              <option value="">Any</option>
              <option value="Fresher">Fresher</option>
              <option value="0-1">0-1 years</option>
              <option value="1-3">1-3 years</option>
              <option value="3-5">3-5 years</option>
              <option value="5+">5+ years</option>
            </select>
          </div>
        </div>
        <div className="button-row">
          <button
            type="button"
            className="btn btn--primary js-settings-save"
            onClick={handleSave}
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
