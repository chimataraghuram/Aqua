import { createRoot } from 'react-dom/client';
import '../popup/style.css';
import type { Platform, Settings } from '../../shared/types';
import { useEffect, useState } from 'react';

const msg = (x: unknown) =>
  new Promise<any>((r) => chrome.runtime.sendMessage(x, r));

const PLATFORMS: Array<{ id: Platform; label: string; color: string; tag: string }> = [
  { id: 'leetcode', label: 'LeetCode', color: '#f59e0b', tag: 'LC' },
  { id: 'geeksforgeeks', label: 'GeeksforGeeks', color: '#16a34a', tag: 'GG' },
  { id: 'codechef', label: 'CodeChef', color: '#92400e', tag: '</>' },
  { id: 'hackerrank', label: 'HackerRank', color: '#10b981', tag: 'H' },
];

function App() {
  const [s, setS] = useState<Settings>();
  const [authLogin, setAuthLogin] = useState<string>('');
  const [repos, setRepos] = useState<any[]>([]);
  const [branches, setBranches] = useState<string[]>([]);
  const [repoSection, setRepoSection] = useState<'create' | 'existing' | 'both'>('both');
  const [pat, setPat] = useState('');
  const [newRepoName, setNewRepoName] = useState('');
  const [newRepoPrivate, setNewRepoPrivate] = useState(true);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    msg({ type: 'GET_STATE' }).then(async (d) => {
      setS(d.settings);
      document.body.classList.toggle('dark', Boolean(d.settings?.darkMode));
      if (d.auth) {
        setAuthLogin(d.auth.login || '');
        const list = await msg({ type: 'GET_REPOS' });
        if (Array.isArray(list)) setRepos(list);
        if (d.settings?.repository) {
          setRepoSection('existing');
          const b = await msg({
            type: 'GET_BRANCHES',
            repository: d.settings.repository,
          });
          if (Array.isArray(b)) setBranches(b.map((x: any) => x.name));
        }
      }
    });
  }, []);

  if (!s) return <main>Loading…</main>;

  const set = <K extends keyof Settings>(k: K, v: Settings[K]) =>
    setS((prev) => (prev ? { ...prev, [k]: v } : prev));

  const togglePlatform = (p: Platform, enabled: boolean) =>
    set('enabledPlatforms', { ...s.enabledPlatforms, [p]: enabled });

  const handleCreateRepo = async () => {
    setError('');
    setNotice('');
    const name = newRepoName.trim();
    if (!name) {
      setError('Enter a repository name.');
      return;
    }
    const created = await msg({
      type: 'CREATE_REPO',
      name,
      isPrivate: newRepoPrivate,
      includeReadme: true,
    });
    if (created?.error) {
      setError(created.error);
      return;
    }
    setRepos([created, ...repos]);
    setBranches([created.default_branch || 'main']);
    setRepoSection('create');
    setS((prev) =>
      prev
        ? {
            ...prev,
            repository: created.full_name,
            branch: created.default_branch,
          }
        : prev
    );
    setNewRepoName('');
    setNotice(`Created and selected ${created.full_name}.`);
  };

  return (
    <main className="options">
      <header className="options-topbar">
        <div className="topbar-left">
          <img src="/icon.svg" alt="Aqua" width={26} height={26} />
          <h1 className="brand">
            <span>Aqua</span>
          </h1>
          <span style={{ color: '#cbd5e1' }}>|</span>
          <p className="subtitle">by TechBoy · Solve. Flow. Sync.</p>
        </div>
        <div
          style={{
            position: 'absolute',
            right: '16px',
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
          }}
        >
          <button
            type="button"
            className="secondary"
            onClick={async () => {
              const next = !s.darkMode;
              const updated = { ...s, darkMode: next };
              setS(updated);
              document.body.classList.toggle('dark', next);
              await msg({ type: 'SAVE_SETTINGS', settings: updated });
            }}
          >
            {s.darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
          {authLogin && (
            <button
              type="button"
              className="logout-btn"
              style={{ position: 'static' }}
              onClick={async () => {
                setError('');
                await msg({ type: 'DISCONNECT_GITHUB' });
                setAuthLogin('');
                setRepos([]);
                setBranches([]);
                setNotice('Logged out from GitHub.');
              }}
            >
              Logout
            </button>
          )}
        </div>
      </header>

      <div className="stepper" style={{ marginBottom: '22px' }}>
        <div className="step">
          <span className="step-num">1</span>
          <div>
            <strong>Connect</strong>
            <small>Link your account</small>
          </div>
        </div>
        <div className="step-line" />
        <div className="step">
          <span className="step-num">2</span>
          <div>
            <strong>Configure</strong>
            <small>Set your preferences</small>
          </div>
        </div>
        <div className="step-line" />
        <div className="step">
          <span className="step-num">3</span>
          <div>
            <strong>Organize</strong>
            <small>Manage files</small>
          </div>
        </div>
        <div className="step-line" />
        <div className="step">
          <span className="step-num">4</span>
          <div>
            <strong>Done</strong>
            <small>You&apos;re all set!</small>
          </div>
        </div>
      </div>

      <div className="options-grid">
        <section className="card">
          <div className="card-head">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
              GitHub Connection
            </h2>
            {authLogin && <span className="badge-ok">✓ Done</span>}
          </div>
          <label>
            Personal Access Token (quick connect)
            <input
              type="password"
              value={pat}
              onChange={(e) => setPat(e.target.value)}
              placeholder={
                authLogin ? '•••••••••••••••••••• (token saved)' : 'ghp_... (repo scope)'
              }
            />
          </label>
          <div className="actions">
            <button
              type="button"
              onClick={async () => {
                setError('');
                setNotice('');
                const res = await msg({ type: 'CONNECT_PAT', token: pat });
                if (res?.error) {
                  setError(res.error);
                  return;
                }
                setPat('');
                setAuthLogin(res.auth.login);
                const list = await msg({ type: 'GET_REPOS' });
                if (Array.isArray(list)) setRepos(list);
                setNotice(`Connected as ${res.auth.login}.`);
              }}
            >
              Connect with Token
            </button>
            <button
              type="button"
              className="secondary"
              onClick={async () => {
                setError('');
                setNotice('');
                if (!s.repository) {
                  setError('Select or create a repository first.');
                  return;
                }
                const b = await msg({ type: 'GET_BRANCHES', repository: s.repository });
                if (b?.error) setError(b.error);
                else setNotice(`Connection OK: ${s.repository} (${s.branch || 'main'}).`);
              }}
            >
              Test connection
            </button>
          </div>
          <label>
            OAuth client ID (optional, for Device Flow)
            <input
              value={s.githubClientId}
              onChange={(e) => set('githubClientId', e.target.value)}
              placeholder="GitHub OAuth client ID"
            />
          </label>
          {authLogin && (
            <div
              style={{
                marginTop: '14px',
                padding: '10px 14px',
                borderRadius: '10px',
                background: 'rgba(220, 252, 231, 0.7)',
                color: '#15803d',
                fontSize: '13px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>● Signed in as @{authLogin}</span>
              <span style={{ fontSize: '12px', fontWeight: 500 }}>Ready to sync</span>
            </div>
          )}
        </section>

        <section className="card">
          <div className="card-head">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              </svg>
              Repository
            </h2>
            {s.repository && <span className="badge-ok">✓ Done</span>}
          </div>

          <details open={repoSection === 'create' || repoSection === 'both'}>
            <summary
              onClick={(e) => {
                e.preventDefault();
                setRepoSection(repoSection === 'create' ? 'existing' : 'create');
              }}
              style={{ cursor: 'pointer', fontWeight: 600, margin: '8px 0' }}
            >
              Create a new repository
            </summary>
            <label>
              Repository name
              <input
                value={newRepoName}
                onChange={(e) => setNewRepoName(e.target.value)}
                placeholder="e.g. dsa-solutions"
              />
            </label>
            <label>
              Visibility
              <select
                value={newRepoPrivate ? 'private' : 'public'}
                onChange={(e) => setNewRepoPrivate(e.target.value === 'private')}
              >
                <option value="private">Private</option>
                <option value="public">Public</option>
              </select>
            </label>
            <button type="button" className="btn-full" onClick={handleCreateRepo}>
              + Create &amp; select repository
            </button>
          </details>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              margin: '12px 0',
              color: '#64748b',
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            <hr style={{ flex: 1, margin: 0 }} />
            <span>OR</span>
            <hr style={{ flex: 1, margin: 0 }} />
          </div>

          <details open={repoSection === 'existing' || repoSection === 'both'}>
            <summary
              onClick={(e) => {
                e.preventDefault();
                setRepoSection(repoSection === 'existing' ? 'create' : 'existing');
              }}
              style={{ cursor: 'pointer', fontWeight: 600, margin: '8px 0' }}
            >
              Use existing repository
            </summary>
            <label>
              Repository
              <select
                value={s.repository || ''}
                onChange={async (e) => {
                  const repo = e.target.value;
                  set('repository', repo);
                  if (repo) {
                    setRepoSection('existing');
                    const b = await msg({ type: 'GET_BRANCHES', repository: repo });
                    if (Array.isArray(b)) {
                      const names = b.map((x: any) => x.name);
                      setBranches(names);
                      set('branch', names[0] || 'main');
                    }
                  } else {
                    setBranches([]);
                  }
                }}
              >
                <option value="">Select repository</option>
                {repos.map((r) => (
                  <option key={r.full_name} value={r.full_name}>
                    {r.full_name} ({r.private ? 'private' : 'public'})
                  </option>
                ))}
              </select>
            </label>

            <label>
              Branch
              {branches.length > 0 ? (
                <select
                  value={s.branch || ''}
                  onChange={(e) => set('branch', e.target.value)}
                >
                  {branches.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  value={s.branch || ''}
                  onChange={(e) => set('branch', e.target.value)}
                  placeholder="main"
                />
              )}
            </label>
          </details>

          {s.repository && (
            <div
              style={{
                marginTop: '14px',
                padding: '10px 14px',
                borderRadius: '10px',
                background: 'rgba(220, 252, 231, 0.7)',
                color: '#15803d',
                fontSize: '13px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>● Active: {s.repository}</span>
              <span style={{ fontSize: '12px', fontWeight: 500 }}>
                {s.branch || 'main'}
              </span>
            </div>
          )}
        </section>

        <section className="card">
          <div className="card-head">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                <path d="M23 4v6h-6M1 20v-6h6" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
              Platforms &amp; Sync
            </h2>
            {PLATFORMS.some((p) => s.enabledPlatforms?.[p.id] ?? true) && (
              <span className="badge-ok">✓ Done</span>
            )}
          </div>
          {PLATFORMS.map((p) => (
            <label
              key={p.id}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
            >
              <input
                type="checkbox"
                checked={s.enabledPlatforms?.[p.id] ?? true}
                onChange={(e) => togglePlatform(p.id, e.target.checked)}
              />
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '22px',
                  height: '22px',
                  borderRadius: '6px',
                  background: p.color,
                  color: '#ffffff',
                  fontSize: '10px',
                  fontWeight: 800,
                }}
              >
                {p.tag}
              </span>
              <span>{p.label}</span>
            </label>
          ))}
          <div
            style={{
              margin: '12px 0',
              padding: '10px 12px',
              borderRadius: '10px',
              background: 'rgba(239, 246, 255, 0.85)',
              fontSize: '12px',
              color: '#1e3a8a',
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: '4px' }}>
              Handled automatically for you:
            </div>
            <div>✓ Automatically sync accepted submissions</div>
          </div>
          <label>
            Duplicate behavior
            <select
              value={s.duplicateBehavior}
              onChange={(e) =>
                set('duplicateBehavior', e.target.value as Settings['duplicateBehavior'])
              }
            >
              <option value="update">Update existing</option>
              <option value="skip">Skip</option>
              <option value="ask">Ask before updating</option>
            </select>
          </label>
        </section>

        <section className="card">
          <div className="card-head">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
              File Organization
            </h2>
            {s.rootFolder && <span className="badge-ok">✓ Done</span>}
          </div>
          <label>
            Root folder
            <input
              value={s.rootFolder}
              onChange={(e) => set('rootFolder', e.target.value)}
            />
          </label>
          <div
            style={{
              margin: '12px 0',
              padding: '10px 12px',
              borderRadius: '10px',
              background: 'rgba(239, 246, 255, 0.85)',
              fontSize: '12px',
              color: '#1e3a8a',
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: '6px' }}>
              Handled automatically for you:
            </div>
            <div>✓ Organized by platform folder</div>
            <div>✓ Problem ID included in folder name</div>
            <div>✓ Auto-generated README.md per problem</div>
            <div style={{ marginTop: '6px', color: '#475569', fontFamily: 'monospace' }}>
              {s.rootFolder || 'Coding-Solutions'}/LeetCode/0001-two-sum/solution.py
            </div>
          </div>
          <label>
            Commit template
            <input
              value={s.commitTemplate}
              onChange={(e) => set('commitTemplate', e.target.value)}
            />
          </label>
        </section>
      </div>

      <div className="options-footer">
        <button
          onClick={async () => {
            setError('');
            await msg({ type: 'SAVE_SETTINGS', settings: s });
            setNotice('Settings saved.');
          }}
        >
          ✓ Save All Changes
        </button>
        {notice && <p className="ok">{notice}</p>}
        {error && <p className="bad">{error}</p>}
      </div>

      <footer className="dev-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/icon.svg" alt="TechBoy" width={28} height={28} />
          <div>
            <div style={{ color: '#0f172a', fontWeight: 700, fontSize: '13px' }}>
              Developed by TechBoy
            </div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>
              Build. Learn. Grow.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <a
            className="repo-link"
            style={{ margin: 0 }}
            href="https://github.com/chimataraghuram/Aqua"
            target="_blank"
            rel="noreferrer"
          >
            GitHub Repository
          </a>
          <a
            className="badge-ok"
            style={{ textDecoration: 'none', background: '#e2e8f0', color: '#0f172a' }}
            href="https://github.com/chimataraghuram/Aqua"
            target="_blank"
            rel="noreferrer"
          >
            ★ Star
          </a>
          <a
            className="badge-ok"
            style={{ textDecoration: 'none', background: '#dbeafe', color: '#1d4ed8' }}
            href="https://github.com/chimataraghuram/Aqua/pulls"
            target="_blank"
            rel="noreferrer"
          >
            Contribute
          </a>
        </div>

        <div>
          <div style={{ color: '#0f172a', fontWeight: 700, fontSize: '12px' }}>
            Contact Me
          </div>
          <a
            className="repo-link"
            style={{ margin: 0, fontSize: '12px' }}
            href="mailto:chimataraghuram02a@gmail.com"
          >
            chimataraghuram02a@gmail.com
          </a>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <a
            href="https://github.com/chimataraghuram"
            target="_blank"
            rel="noreferrer"
            title="GitHub"
            style={{ color: '#0f172a' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </a>
          <a
            href="https://www.linkedin.com/in/chimataraghuram"
            target="_blank"
            rel="noreferrer"
            title="LinkedIn"
            style={{ color: '#0a66c2' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
            </svg>
          </a>
        </div>
      </footer>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
