import { useState, useMemo } from 'react';
import { JOBS } from '../data/jobs';
import { useApp } from '../context/AppContext';
import { filterAndSortJobs } from '../utils/jobs';
import FilterBar from '../components/FilterBar';
import JobCard from '../components/JobCard';
import JobModal from '../components/JobModal';

const initialFilters = {
  keyword: '',
  location: '',
  mode: '',
  experience: '',
  source: '',
  sort: 'latest',
};

export default function Saved() {
  const { savedIds, saveJob } = useApp();
  const [filters, setFilters] = useState(initialFilters);
  const [modalJob, setModalJob] = useState(null);

  const savedJobs = useMemo(
    () => JOBS.filter((j) => savedIds.includes(j.id)),
    [savedIds]
  );
  const list = useMemo(
    () => filterAndSortJobs(savedJobs, filters),
    [savedJobs, filters]
  );
  const savedSet = useMemo(() => {
    const s = {};
    savedIds.forEach((id) => (s[id] = true));
    return s;
  }, [savedIds]);

  return (
    <>
      <div className="jobs-view">
        <FilterBar filters={filters} onChange={setFilters} />
        <div id="job-cards-grid" className="job-cards-grid">
          {list.length === 0 ? (
            <div id="saved-empty-state" className="empty-state">
              <p className="empty-state__title">No saved jobs yet.</p>
              <p className="empty-state__body">
                Save jobs from the Dashboard to revisit them here.
              </p>
            </div>
          ) : (
            list.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                saved={!!savedSet[job.id]}
                onView={setModalJob}
                onSave={saveJob}
                onApply={() => window.open(job.applyUrl, '_blank')}
              />
            ))
          )}
        </div>
      </div>
      {modalJob && (
        <JobModal
          job={modalJob}
          saved={!!savedSet[modalJob.id]}
          onClose={() => setModalJob(null)}
          onSave={(id) => {
            saveJob(id);
            setModalJob(null);
          }}
        />
      )}
    </>
  );
}
