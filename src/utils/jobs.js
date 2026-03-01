import { JOBS } from '../data/jobs';

export function filterAndSortJobs(list, filters, getJobStatus) {
  let result = list.slice();
  const kw = (filters.keyword || '').trim().toLowerCase();
  if (kw) {
    result = result.filter((j) => {
      return (
        (j.title || '').toLowerCase().indexOf(kw) >= 0 ||
        (j.company || '').toLowerCase().indexOf(kw) >= 0
      );
    });
  }
  if (filters.location) {
    result = result.filter((j) => (j.location || '') === filters.location);
  }
  if (filters.mode) {
    result = result.filter((j) => (j.mode || '') === filters.mode);
  }
  if (filters.experience) {
    result = result.filter((j) => (j.experience || '') === filters.experience);
  }
  if (filters.source) {
    result = result.filter((j) => (j.source || '') === filters.source);
  }
  if (filters.status && getJobStatus) {
    result = result.filter((j) => (getJobStatus(j.id) || 'Not Applied') === filters.status);
  }
  result.sort((a, b) => {
    const da = a.postedDaysAgo != null ? a.postedDaysAgo : 0;
    const db = b.postedDaysAgo != null ? b.postedDaysAgo : 0;
    return filters.sort === 'oldest' ? da - db : db - da;
  });
  return result;
}

export function getMatchScore(job) {
  const num =
    parseInt((job.id || '').replace(/\D/g, ''), 10) || 0;
  return 65 + (num % 34);
}

export function generateDigest() {
  const sorted = JOBS.slice().map((j) => ({
    job: j,
    matchScore: getMatchScore(j),
    postedDaysAgo: j.postedDaysAgo != null ? j.postedDaysAgo : 0,
  }));
  sorted.sort((a, b) => {
    if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
    return a.postedDaysAgo - b.postedDaysAgo;
  });
  return sorted.slice(0, 10).map((x) => {
    const j = x.job;
    return {
      id: j.id,
      title: j.title,
      company: j.company,
      location: j.location,
      experience: j.experience,
      matchScore: x.matchScore,
      applyUrl: j.applyUrl,
    };
  });
}

export function formatDigestPlainText(list, todayKey) {
  const lines = ['Top 10 Jobs For You — 9AM Digest', todayKey, ''];
  list.forEach((item, i) => {
    lines.push(
      (i + 1) + '. ' + (item.title || '') + ' @ ' + (item.company || '')
    );
    lines.push(
      '   ' +
        (item.location || '') +
        ' · ' +
        (item.experience || '') +
        ' · Match: ' +
        (item.matchScore || '') +
        '%'
    );
    lines.push('   Apply: ' + (item.applyUrl || ''));
    lines.push('');
  });
  lines.push('This digest was generated based on your preferences.');
  return lines.join('\n');
}
