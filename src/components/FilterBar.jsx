import { useMemo } from 'react';
import { JOBS } from '../data/jobs';

export default function FilterBar({ filters, onChange, showStatusFilter = false }) {
  const locations = useMemo(() => {
    const locs = {};
    JOBS.forEach((j) => {
      if (j.location) locs[j.location] = true;
    });
    return Object.keys(locs).sort();
  }, []);

  return (
    <div className="filter-bar">
      <input
        id="filter-keyword"
        type="text"
        className="field__control filter-bar__keyword"
        placeholder="Keyword"
        value={filters.keyword}
        onChange={(e) => onChange({ ...filters, keyword: e.target.value })}
      />
      <select
        id="filter-location"
        className="field__control filter-bar__select"
        value={filters.location}
        onChange={(e) => onChange({ ...filters, location: e.target.value })}
      >
        <option value="">Location</option>
        {locations.map((l) => (
          <option key={l} value={l}>
            {l}
          </option>
        ))}
      </select>
      <select
        id="filter-mode"
        className="field__control filter-bar__select"
        value={filters.mode}
        onChange={(e) => onChange({ ...filters, mode: e.target.value })}
      >
        <option value="">Mode</option>
        <option value="Remote">Remote</option>
        <option value="Hybrid">Hybrid</option>
        <option value="Onsite">Onsite</option>
      </select>
      <select
        id="filter-experience"
        className="field__control filter-bar__select"
        value={filters.experience}
        onChange={(e) => onChange({ ...filters, experience: e.target.value })}
      >
        <option value="">Experience</option>
        <option value="Fresher">Fresher</option>
        <option value="0-1">0-1</option>
        <option value="1-3">1-3</option>
        <option value="3-5">3-5</option>
        <option value="5+">5+</option>
      </select>
      <select
        id="filter-source"
        className="field__control filter-bar__select"
        value={filters.source}
        onChange={(e) => onChange({ ...filters, source: e.target.value })}
      >
        <option value="">Source</option>
        <option value="LinkedIn">LinkedIn</option>
        <option value="Naukri">Naukri</option>
        <option value="Indeed">Indeed</option>
      </select>
      {showStatusFilter && (
        <select
          id="filter-status"
          className="field__control filter-bar__select"
          value={filters.status || ''}
          onChange={(e) => onChange({ ...filters, status: e.target.value || '' })}
        >
          <option value="">All</option>
          <option value="Not Applied">Not Applied</option>
          <option value="Applied">Applied</option>
          <option value="Rejected">Rejected</option>
          <option value="Selected">Selected</option>
        </select>
      )}
      <select
        id="filter-sort"
        className="field__control filter-bar__select"
        value={filters.sort}
        onChange={(e) => onChange({ ...filters, sort: e.target.value })}
      >
        <option value="latest">Latest first</option>
        <option value="oldest">Oldest first</option>
      </select>
    </div>
  );
}
