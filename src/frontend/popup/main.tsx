import { createRoot } from 'react-dom/client';
import './style.css';
import type { SyncRecord } from '../../shared/types';
import { useEffect, useState } from 'react';

const msg = (x: unknown) =>
  new Promise<any>((r) => chrome.runtime.sendMessage(x, r));

function App() {
  const [data, setData] = useState<any>();
  const [error, setError] = useState('');
  const load = () => msg({ type: 'GET_STATE' }).then(setData);

  useEffect(() => {
    load();
  }, []);

  if (!data) return <main>Loading Aqua…</main>;

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
