import { useEffect } from 'react';

export default function JobModal({ job, saved, onClose, onSave, onApply }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!job) return null;

  const skills = job.skills || [];

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="job-modal-title">
      <div
        className="modal__backdrop"
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Enter' && onClose()}
        role="button"
        tabIndex={0}
        aria-label="Close modal"
      />
      <div className="modal__panel">
        <div className="modal__header">
          <h2 id="job-modal-title" className="modal__title">
            {job.title || ''}
          </h2>
          <button
            type="button"
            className="modal__close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="modal__body">
          <p className="modal__meta">
            {(job.company || '') +
              ' · ' +
              (job.location || '') +
              ' · ' +
              (job.mode || '')}
            <br />
            {job.salaryRange || ''} · {job.source || ''}
          </p>
          <p className="modal__description">{job.description || ''}</p>
          <p className="modal__skills">
            {skills.length ? 'Skills: ' + skills.join(', ') : ''}
          </p>
        </div>
        <div className="modal__footer">
          <button
            type="button"
            className="btn btn--secondary js-modal-save"
            onClick={() => onSave(job.id)}
            disabled={saved}
          >
            {saved ? 'Saved' : 'Save'}
          </button>
          <a
            href={job.applyUrl || '#'}
            target="_blank"
            rel="noopener"
            className="btn btn--primary js-modal-apply"
          >
            Apply
          </a>
        </div>
      </div>
    </div>
  );
}
