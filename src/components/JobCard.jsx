function formatPosted(days) {
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  return days + ' days ago';
}

export default function JobCard({ job, saved, onView, onSave, onApply }) {
  const posted = formatPosted(
    typeof job.postedDaysAgo === 'number' ? job.postedDaysAgo : 0
  );
  const sourceClass = (job.source || 'other').toLowerCase();

  return (
    <div className="job-card" data-job-id={job.id}>
      <h3 className="job-card__title">{job.title || ''}</h3>
      <p className="job-card__company">{job.company || ''}</p>
      <p className="job-card__meta">
        {(job.location || '') + ' · ' + (job.mode || '')}
      </p>
      <p className="job-card__meta">Experience: {job.experience || ''}</p>
      <p className="job-card__salary">{job.salaryRange || ''}</p>
      <span className={`source-badge source-badge--${sourceClass}`}>
        {job.source || ''}
      </span>
      <span className="job-card__posted">{posted}</span>
      <div className="job-card__actions">
        <button
          type="button"
          className="btn btn--secondary btn--sm js-job-view"
          onClick={() => onView(job)}
        >
          View
        </button>
        <button
          type="button"
          className="btn btn--secondary btn--sm js-job-save"
          onClick={() => onSave(job.id)}
        >
          {saved ? 'Saved' : 'Save'}
        </button>
        <a
          href={job.applyUrl || '#'}
          target="_blank"
          rel="noopener"
          className="btn btn--primary btn--sm js-job-apply"
        >
          Apply
        </a>
      </div>
    </div>
  );
}
