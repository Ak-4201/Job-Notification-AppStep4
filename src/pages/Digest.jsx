import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { generateDigest, formatDigestPlainText } from '../utils/jobs';

function copyToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text);
  }
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.left = '-9999px';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    return Promise.resolve();
  } catch (e) {
    return Promise.reject(e);
  } finally {
    document.body.removeChild(ta);
  }
}

function handleEmailDraft(list, getTodayKey, formatFn) {
  if (!list || list.length === 0) return;
  const subject = 'My 9AM Job Digest';
  let body = formatFn(list, getTodayKey());
  if (body.length > 800)
    body = body.slice(0, 800) + '\n\n[Content truncated…]';
  window.location.href =
    'mailto:?subject=' +
    encodeURIComponent(subject) +
    '&body=' +
    encodeURIComponent(body);
}

export default function Digest() {
  const {
    preferences,
    loadDigest,
    saveDigest,
    getTodayKey,
    loadStatusUpdates,
  } = useApp();
  const [digest, setDigest] = useState(() => loadDigest());
  const [copyLabel, setCopyLabel] = useState('Copy Digest to Clipboard');
  const statusUpdates = loadStatusUpdates();

  const hasPrefs = !!preferences;

  const handleGenerate = useCallback(() => {
    const existing = loadDigest();
    if (!existing) {
      const list = generateDigest();
      saveDigest(list);
      setDigest(list);
    } else {
      setDigest(existing);
    }
  }, [loadDigest, saveDigest]);

  const handleCopy = useCallback(() => {
    const list = loadDigest();
    if (!list || list.length === 0) return;
    const text = formatDigestPlainText(list, getTodayKey());
    copyToClipboard(text)
      .then(() => {
        setCopyLabel('Copied');
        setTimeout(() => setCopyLabel('Copy Digest to Clipboard'), 2000);
      })
      .catch(() => {
        window.alert(
          'Could not copy. Please select and copy the digest manually.'
        );
      });
  }, [loadDigest, getTodayKey]);

  const handleEmail = useCallback(() => {
    const list = loadDigest();
    handleEmailDraft(list, getTodayKey, formatDigestPlainText);
  }, [loadDigest, getTodayKey]);

  return (
    <div className="digest-view">
      {!hasPrefs && (
        <div id="digest-no-prefs" className="digest-blocking">
          <p className="digest-blocking__text">
            Set preferences to generate a personalized digest
          </p>
          <Link to="/settings" className="btn btn--primary js-digest-go-settings">
            Go to Settings
          </Link>
        </div>
      )}

      {hasPrefs && !digest && (
        <div id="digest-generate-area" className="digest-generate-area">
          <button
            type="button"
            className="btn btn--primary js-digest-generate"
            onClick={handleGenerate}
          >
            Generate Today&apos;s 9AM Digest (Simulated)
          </button>
          <p className="digest-sim-note">
            Top 10 jobs by match score and freshness will be shown.
          </p>
        </div>
      )}

      {hasPrefs && digest && digest.length === 0 && (
        <div id="digest-no-matches" className="digest-blocking">
          <p className="digest-blocking__text">No matching jobs for today.</p>
        </div>
      )}

      {statusUpdates.length > 0 && (
        <div className="digest-status-updates digest-card">
          <h2 className="digest-card__title">Recent Status Updates</h2>
          <div className="digest-status-updates__list">
            {statusUpdates.map((u, i) => (
              <div key={`${u.jobId}-${u.dateChanged}-${i}`} className="digest-status-update">
                <span className="digest-status-update__title">{u.title}</span>
                <span className="digest-status-update__company">{u.company}</span>
                <span className={`digest-status-update__badge digest-status-update__badge--${u.status.toLowerCase().replace(' ', '-')}`}>
                  {u.status}
                </span>
                <span className="digest-status-update__date">
                  {u.dateChanged ? new Date(u.dateChanged).toLocaleDateString() : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {hasPrefs && digest && digest.length > 0 && (
        <div id="digest-content" className="digest-content">
          <div className="digest-card">
            <h2 className="digest-card__title">
              Top 10 Jobs For You — 9AM Digest
            </h2>
            <p id="digest-date" className="digest-card__date">
              {getTodayKey()}
            </p>
            <div className="digest-jobs-list" id="digest-jobs-list">
              {digest.map((item) => (
                <div key={item.id} className="digest-job">
                  <h3 className="digest-job__title">{item.title || ''}</h3>
                  <p className="digest-job__meta">
                    {(item.company || '') +
                      ' · ' +
                      (item.location || '') +
                      ' · ' +
                      (item.experience || '')}
                  </p>
                  <p className="digest-job__score">
                    Match: {String(item.matchScore || '')}%
                  </p>
                  <a
                    href={item.applyUrl || '#'}
                    target="_blank"
                    rel="noopener"
                    className="btn btn--primary btn--sm"
                  >
                    Apply
                  </a>
                </div>
              ))}
            </div>
            <div className="digest-actions">
              <button
                type="button"
                className="btn btn--secondary js-digest-copy"
                onClick={handleCopy}
              >
                {copyLabel}
              </button>
              <button
                type="button"
                className="btn btn--primary js-digest-email"
                onClick={handleEmail}
              >
                Create Email Draft
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
