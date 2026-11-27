import { createRoot } from 'react-dom/client';
import './style.css';
import type { SyncRecord } from '../../shared/types';
import { useEffect, useState } from 'react';

const hasRuntime =
  typeof chrome !== 'undefined' && Boolean(chrome?.runtime?.id);

const PREVIEW_STATE = {
  settings: {
    repository: 'techboy/coding-solutions',
    branch: 'main',
    darkMode: false,
  },
  history: [
    {
      id: 'preview-1',
      status: 'success',
      timestamp: Date.now(),
      submission: {
        platform: 'leetcode',
        title: '1. Two Sum',
        slug: 'two-sum',
        difficulty: 'Easy',
      },
    },
  ],
  pending: [],
};

const msg = (x: unknown) =>
  hasRuntime
    ? new Promise<any>((r) => chrome.runtime.sendMessage(x, r))
    : Promise.resolve(
        (x as { type?: string })?.type === 'GET_STATE' ? PREVIEW_STATE : { ok: true }
      );

const CODING_HOSTS = [
  'leetcode.com',
  'geeksforgeeks.org',
  'codechef.com',
  'hackerrank.com',
];

const isCodingUrl = (url?: string): boolean => {
  if (!url) return false;
  try {
    const host = new URL(url).hostname;
    return CODING_HOSTS.some((d) => host === d || host.endsWith(`.${d}`));
  } catch {
    return false;
  }
};

const dayKey = (ts: number): string => {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
};

const computeStreak = (records: SyncRecord[]): number => {
  const days = new Set(
    records.filter((r) => r.status === 'success').map((r) => dayKey(r.timestamp))
  );
  if (days.size === 0) return 0;
  let streak = 0;
  const cursor = new Date();
  if (!days.has(dayKey(cursor.getTime()))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (days.has(dayKey(cursor.getTime()))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
};

function App() {
  const [data, setData] = useState<any>();
  const [onCodingSite, setOnCodingSite] = useState<boolean>(true);
  const [error, setError] = useState('');
  const load = () =>
    msg({ type: 'GET_STATE' }).then((d) => {
      document.body.classList.toggle('dark', Boolean(d?.settings?.darkMode));
      setData(d);
    });

  useEffect(() => {
    load();
    if (typeof chrome !== 'undefined' && chrome?.tabs?.query) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        setOnCodingSite(isCodingUrl(tabs[0]?.url));
      });
    } else {
      setOnCodingSite(true);
    }
  }, []);

  if (!data) return <main>Loading Aqua…</main>;

  if (!onCodingSite) {
    return (
      <main>
        <div
          style={{
            position: 'relative',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '76px',
            height: '76px',
            borderRadius: '20px',
            background: '#e2e8f0',
            margin: '8px auto 14px',
          }}
        >
          <img
            src="/icon128.png"
            alt="Aqua"
            width={56}
            height={56}
            style={{ borderRadius: '12px', filter: 'grayscale(100%)', opacity: 0.65 }}
          />
          <span
            style={{
              position: 'absolute',
              right: '-6px',
              bottom: '-6px',
              width: '28px',
              height: '28px',
              borderRadius: '999px',
              background: '#475569',
              color: '#ffffff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
            </svg>
          </span>
        </div>

        <h1 className="brand" style={{ fontSize: '20px', marginBottom: '6px' }}>
          Privacy Zone
        </h1>
        <p className="subtitle" style={{ lineHeight: 1.5, marginBottom: '16px' }}>
          <strong>Aqua</strong> works only on coding sites
          <br />
          <small>LeetCode · GeeksforGeeks · CodeChef · HackerRank</small>
        </p>

        <div className="actions">
          <button
            className="secondary"
            onClick={() => chrome.runtime.openOptionsPage()}
          >
            Settings
          </button>
        </div>
      </main>
    );
  }

  const history = (data.history || []) as SyncRecord[];
  const solved = new Map<string, SyncRecord>();
  const todaySolved = new Set<string>();
  const today = dayKey(Date.now());

  for (const rec of history) {
    if (rec.status === 'success') {
      const key = `${rec.submission.platform || 'leetcode'}:${rec.submission.slug}`;
      if (!solved.has(key)) solved.set(key, rec);
      if (dayKey(rec.timestamp) === today) todaySolved.add(key);
    }
  }

  const solvedList = Array.from(solved.values());
  const streak = computeStreak(history);
  const countDiff = (d: string) =>
    solvedList.filter((r) =>
      (r.submission.difficulty || '').toLowerCase().includes(d)
    ).length;

  const countPlat = (p: string) =>
    solvedList.filter((r) => (r.submission.platform || 'leetcode') === p).length;

  const repo = data.settings?.repository as string | undefined;

  return (
    <main>
      <img
        src="/icon128.png"
        alt="Aqua"
        width={40}
        height={40}
        style={{ marginBottom: '4px' }}
      />
      <h1 className="brand" style={{ fontSize: '20px', marginBottom: '2px' }}>
        <span>Aqua</span>
      </h1>
      <p className="subtitle" style={{ fontSize: '12px', marginBottom: '8px' }}>
        Code More. Manage Less. ⚡
      </p>

      {data.auth ? (
        <>
          <div className="streak-box">
            <svg
              className="streak-svg"
              width="52"
              height="58"
              viewBox="0 0 64 72"
              fill="none"
            >
              <ellipse cx="32" cy="64" rx="18" ry="5" fill="rgba(245, 158, 11, 0.28)" />
              <path
                d="M34 4C34 4 49 18 49 36C49 48.5 41.5 58 32 58C22.5 58 15 48.5 15 36C15 26 20 18 20 18C20 18 22 25 26 26C25 16 34 4 34 4Z"
                fill="#f59e0b"
              />
              <path
                d="M33 28C33 28 40 35 40 43C40 48.5 36.5 53 32 53C27.5 53 24 48.5 24 43C24 37 28.5 31 33 28Z"
                fill="#fde047"
              />
            </svg>
            <div className="streak-num">{streak}</div>
            <div className="streak-label">day streak</div>
          </div>

          <div>
            {repo ? (
              <a
                className="repo-link"
                href={`https://github.com/${repo}`}
                target="_blank"
                rel="noreferrer"
              >
                {repo}
              </a>
            ) : (
              <p className="subtitle">No repository selected</p>
            )}
          </div>

          <hr />
          <p className="solved-total" style={{ marginBottom: '4px' }}>
            Total Solved: {solvedList.length}
          </p>
          <p className="subtitle" style={{ marginBottom: '10px', fontSize: '12px' }}>
            Solved Today: <strong>{todaySolved.size}</strong>
          </p>

          <div className="diff-row">
            <div className="diff-easy">
              Easy: <span>{countDiff('easy')}</span>
            </div>
            <div className="diff-medium">
              Medium: <span>{countDiff('medium')}</span>
            </div>
            <div className="diff-hard">
              Hard: <span>{countDiff('hard')}</span>
            </div>
          </div>
          <p className="subtitle" style={{ marginBottom: '12px' }}>
            LC: {countPlat('leetcode')} · GfG: {countPlat('geeksforgeeks')} ·
            CC: {countPlat('codechef')} · HR: {countPlat('hackerrank')}
          </p>

          <div className="actions">
            <button
              className="secondary"
              onClick={() => chrome.runtime.openOptionsPage()}
            >
              Settings
            </button>
          </div>
        </>
      ) : (
        <>
          <hr />
          <p className="subtitle" style={{ fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
            Solve. Flow. Sync.
          </p>
          <p className="subtitle" style={{ fontSize: '12px', lineHeight: 1.5, marginBottom: '16px' }}>
            LeetCode · GeeksforGeeks · CodeChef · HackerRank → GitHub
          </p>
          <div className="actions">
            <button
              style={{ width: '100%' }}
              onClick={() => chrome.runtime.openOptionsPage()}
            >
              Get Started — Setup GitHub →
            </button>
          </div>
        </>
      )}

      {error && <p className="bad">{error}</p>}
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
