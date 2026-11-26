import { CodeChefAdapter } from './codechef/adapter';
import { GeeksforGeeksAdapter } from './geeksforgeeks/adapter';
import { HackerRankAdapter } from './hackerrank/adapter';
import { LeetCodeAdapter } from './leetcode/adapter';
import type { PlatformAdapter } from './types';

function mountAquaPushPill(onManualPush?: () => void) {
  if (!chrome?.runtime?.id || document.getElementById('aqua-push-pill')) return;

  const style = document.createElement('style');
  style.textContent =
    '@keyframes aquaSpin{to{transform:rotate(360deg)}}#aqua-push-pill{position:fixed;bottom:22px;right:22px;z-index:999999;display:flex;align-items:center;gap:8px;padding:8px 14px;border-radius:999px;background:rgba(10,15,28,0.92);color:#f8fafc;font:600 13px/1.2 -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;box-shadow:0 8px 24px rgba(2,132,199,0.35);border:1px solid rgba(56,189,248,0.4);cursor:pointer;transition:transform 0.15s ease,box-shadow 0.15s ease}#aqua-push-pill:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(2,132,199,0.5)}';
  document.head.appendChild(style);

  const pill = document.createElement('button');
  pill.id = 'aqua-push-pill';
  pill.type = 'button';

  const status = document.createElement('span');
  status.id = 'aqua-push-status';
  status.style.display = 'inline-flex';

  const label = document.createElement('span');
  label.id = 'aqua-push-label';
  label.textContent = 'Push';

  const img = document.createElement('img');
  img.src = chrome.runtime.getURL('icon48.png');
  img.width = 20;
  img.height = 20;
  img.style.borderRadius = '5px';

  pill.append(status, label, img);
  if (onManualPush) pill.addEventListener('click', onManualPush);
  document.body.appendChild(pill);
}

function setAquaPushState(
  state: 'syncing' | 'done' | 'error' | 'idle',
  message?: string
) {
  const pill = document.getElementById('aqua-push-pill');
  const status = document.getElementById('aqua-push-status');
  const label = document.getElementById('aqua-push-label');
  if (!pill || !status || !label) return;

  pill.title = message || '';

  if (state === 'syncing') {
    const spinner = document.createElement('span');
    spinner.style.cssText =
      'width:14px;height:14px;border:2px solid rgba(255,255,255,0.25);border-top-color:#38bdf8;border-radius:50%;display:inline-block;animation:aquaSpin 0.8s linear infinite';
    status.replaceChildren(spinner);
    label.textContent = 'Syncing…';
  } else if (state === 'done') {
    const check = document.createElement('span');
    check.style.cssText = 'color:#22c55e;font-weight:800;font-size:15px';
    check.textContent = '✓';
    status.replaceChildren(check);
    label.textContent = 'Synced';
    setTimeout(() => setAquaPushState('idle'), 3000);
  } else if (state === 'error') {
    const cross = document.createElement('span');
    cross.style.cssText = 'color:#ef4444;font-weight:800;font-size:15px';
    cross.textContent = '✕';
    status.replaceChildren(cross);
    label.textContent = message || 'Failed';
    setTimeout(() => setAquaPushState('idle'), 3500);
  } else {
    status.replaceChildren();
    label.textContent = 'Push';
  }
}

function sendToBackground(
  payload: unknown,
  onSuccess: () => void,
  onError: (msg: string) => void
) {
  if (!chrome?.runtime?.id) {
    onError('Reload page');
    return;
  }
  chrome.runtime.sendMessage(payload, (res?: { error?: string }) => {
    if (chrome.runtime.lastError || res?.error) {
      onError(res?.error ? 'Sync failed' : 'Reload page');
      return;
    }
    onSuccess();
  });
}

const adapters: PlatformAdapter[] = [
  new LeetCodeAdapter(),
  new GeeksforGeeksAdapter(),
  new CodeChefAdapter(),
  new HackerRankAdapter(),
];

const active = adapters.find((adapter) => adapter.isPage());
if (active) {
  mountAquaPushPill(() => {
    const submission = active.submission();
    if (!submission) {
      setAquaPushState('error', 'No accepted code');
      return;
    }
    setAquaPushState('syncing');
    sendToBackground(
      { type: 'SYNC', submission },
      () => setAquaPushState('done'),
      (msg) => setAquaPushState('error', msg)
    );
  });

  active.observe((submission) => {
    setAquaPushState('syncing');
    sendToBackground(
      { type: 'SUBMISSION_ACCEPTED', submission },
      () => setAquaPushState('done'),
      (msg) => setAquaPushState('error', msg)
    );
  });
}
