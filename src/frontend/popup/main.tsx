import { createRoot } from 'react-dom/client';
import './style.css';
import type { SyncRecord } from '../../shared/types';
import { useEffect, useState } from 'react';

const msg = (x: unknown) =>
  new Promise<any>((r) => chrome.runtime.sendMessage(x, r));

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
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      setOnCodingSite(isCodingUrl(tabs[0]?.url));
    });
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
            src="/icon.svg"
            alt="Aqua"
            width={48}
            height={48}
            style={{ filter: 'grayscale(100%)', opacity: 0.65 }}
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
  for (const rec of history) {
    if (rec.status === 'success') {
      const key = `${rec.submission.platform || 'leetcode'}:${rec.submission.slug}`;
      if (!solved.has(key)) solved.set(key, rec);
    }
  }
  const solvedList = Array.from(solved.values());
  const countDiff = (d: string) =>
    solvedList.filter((r) =>
      (r.submission.difficulty || '').toLowerCase().includes(d)
    ).length;

  const countPlat = (p: string) =>
    solvedList.filter((r) => (r.submission.platform || 'leetcode') === p).length;

  const repo = data.settings?.repository as string | undefined;

  return (
    <main>
      <h1 className="brand">
        <span>Aqua</span>
      </h1>
      <p className="subtitle">Sync your code from coding platforms to GitHub</p>

      {data.auth ? (
        <>
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
          <hr />
          <p className="solved-total">Problems Solved: {solvedList.length}</p>
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
          <p className="subtitle">
            LC: {countPlat('leetcode')} · GfG: {countPlat('geeksforgeeks')} ·
            CC: {countPlat('codechef')} · HR: {countPlat('hackerrank')}
          </p>

          {data.pending.length > 0 && (
            <div className="actions">
              {data.pending.map((x: SyncRecord) => (
                <button
                  key={x.id}
                  onClick={() => msg({ type: 'RETRY', id: x.id }).then(load)}
                >
                  Retry {x.submission.title}
                </button>
              ))}
            </div>
          )}

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
          <div className="actions">
            <button
              onClick={async () => {
                setError('Complete GitHub authorization in the opened tab…');
                const r = await msg({ type: 'CONNECT_GITHUB' });
                if (r.error) setError(r.error);
                else load();
              }}
            >
              Connect GitHub
            </button>
            <button
              className="secondary"
              onClick={() => chrome.runtime.openOptionsPage()}
            >
              Settings
            </button>
          </div>
        </>
      )}

      {error && <p className="bad">{error}</p>}
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
