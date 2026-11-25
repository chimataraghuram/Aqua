import { createRoot } from 'react-dom/client';
import '../popup/style.css';
import type { Platform, Settings } from '../../shared/types';
import { useEffect, useState } from 'react';

const msg = (x: unknown) =>
  new Promise<any>((r) => chrome.runtime.sendMessage(x, r));

const PLATFORMS: Array<{ id: Platform; label: string }> = [
  { id: 'leetcode', label: 'LeetCode' },
  { id: 'geeksforgeeks', label: 'GeeksforGeeks' },
  { id: 'codechef', label: 'CodeChef' },
  { id: 'hackerrank', label: 'HackerRank' },
];

function App() {
  const [s, setS] = useState<Settings>();
  const [repos, setRepos] = useState<any[]>([]);
  const [branches, setBranches] = useState<string[]>([]);
  const [pat, setPat] = useState('');
  const [newRepoName, setNewRepoName] = useState('');
  const [newRepoPrivate, setNewRepoPrivate] = useState(true);
  const [newRepoReadme, setNewRepoReadme] = useState(true);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    msg({ type: 'GET_STATE' }).then(async (d) => {
      setS(d.settings);
      if (d.auth) {
        const list = await msg({ type: 'GET_REPOS' });
        if (Array.isArray(list)) setRepos(list);
        if (d.settings?.repository) {
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
      includeReadme: newRepoReadme,
    });
    if (created?.error) {
      setError(created.error);
      return;
    }
    setRepos([created, ...repos]);
    setBranches([created.default_branch || 'main']);
    setS({
      ...s,
      repository: created.full_name,
      branch: created.default_branch,
    });
    setNewRepoName('');
    setNotice(`Created and selected ${created.full_name}.`);
  };

  return (
    <main className="options">
      <header>
        <b>AQUA</b>
        <small>by TechBoy</small>
      </header>

      <h2>GitHub</h2>
      <label>
        Personal Access Token (quick connect)
        <input
          type="password"
          value={pat}
          onChange={(e) => setPat(e.target.value)}
          placeholder="ghp_... (repo scope)"
        />
      </label>
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
      <button
        type="button"
        className="secondary"
        onClick={async () => {
          setError('');
          await msg({ type: 'DISCONNECT_GITHUB' });
          setRepos([]);
          setBranches([]);
          setNotice('Disconnected from GitHub.');
        }}
      >
        Disconnect GitHub
      </button>

      <label>
        OAuth client ID (optional, for Device Flow)
        <input
          value={s.githubClientId}
          onChange={(e) => set('githubClientId', e.target.value)}
          placeholder="GitHub OAuth client ID"
        />
      </label>

      <label>
        Create a new repository
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
      <label>
        <input
          type="checkbox"
          checked={newRepoReadme}
          onChange={(e) => setNewRepoReadme(e.target.checked)}
        />{' '}
        Add README automatically
      </label>
      <button type="button" onClick={handleCreateRepo}>
        Create &amp; select repository
      </button>

      <label>
        Or use existing repository
        <select
          value={s.repository || ''}
          onChange={async (e) => {
            const repo = e.target.value;
            set('repository', repo);
            if (repo) {
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

      <h2>Platforms</h2>
      {PLATFORMS.map((p) => (
        <label key={p.id}>
          <input
            type="checkbox"
            checked={s.enabledPlatforms?.[p.id] ?? true}
            onChange={(e) => togglePlatform(p.id, e.target.checked)}
          />{' '}
          {p.label}
        </label>
      ))}

      <h2>Sync</h2>
      <label>
        <input
          type="checkbox"
          checked={s.autoSync}
          onChange={(e) => set('autoSync', e.target.checked)}
        />{' '}
        Automatically sync accepted submissions
      </label>
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

      <h2>File organization</h2>
      <label>
        Root folder
        <input
          value={s.rootFolder}
          onChange={(e) => set('rootFolder', e.target.value)}
        />
      </label>
      <label>
        <input
          type="checkbox"
          checked={s.platformFolders}
          onChange={(e) => set('platformFolders', e.target.checked)}
        />{' '}
        Organize by platform folder
      </label>
      <label>
        <input
          type="checkbox"
          checked={s.includeId}
          onChange={(e) => set('includeId', e.target.checked)}
        />{' '}
        Include problem ID
      </label>
      <label>
        <input
          type="checkbox"
          checked={s.includeReadme}
          onChange={(e) => set('includeReadme', e.target.checked)}
        />{' '}
        Generate README
      </label>
      <label>
        Commit template
        <input
          value={s.commitTemplate}
          onChange={(e) => set('commitTemplate', e.target.value)}
        />
      </label>

      <button
        onClick={async () => {
          setError('');
          await msg({ type: 'SAVE_SETTINGS', settings: s });
          setNotice('Settings saved.');
        }}
      >
        Save settings
      </button>
      {notice && <p className="ok">{notice}</p>}
      {error && <p className="bad">{error}</p>}
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
