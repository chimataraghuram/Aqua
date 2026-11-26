import { CodeChefAdapter } from './codechef/adapter';
import { GeeksforGeeksAdapter } from './geeksforgeeks/adapter';
import { HackerRankAdapter } from './hackerrank/adapter';
import { LeetCodeAdapter } from './leetcode/adapter';
import type { PlatformAdapter } from './types';

function showSyncToast() {
  if (!chrome?.runtime?.id) return;
  const id = 'aqua-sync-toast';
  document.getElementById(id)?.remove();

  const el = document.createElement('div');
  el.id = id;
  el.style.cssText =
    'position:fixed;bottom:24px;right:24px;z-index:999999;display:flex;align-items:center;gap:10px;padding:10px 16px;border-radius:999px;background:rgba(10,15,28,0.92);color:#f8fafc;font:600 13px/1.2 -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;box-shadow:0 8px 24px rgba(2,132,199,0.35);border:1px solid rgba(56,189,248,0.4);transition:opacity 0.3s ease,transform 0.3s ease;transform:translateY(0);';

  const img = document.createElement('img');
  img.src = chrome.runtime.getURL('icon48.png');
  img.width = 22;
  img.height = 22;
  img.style.borderRadius = '6px';

  const text = document.createElement('span');
  text.textContent = 'Aqua · Syncing to GitHub…';

  el.append(img, text);
  document.body.appendChild(el);

  setTimeout(() => {
    text.textContent = 'Aqua · ✓ Synced to GitHub!';
  }, 1200);

  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(8px)';
    setTimeout(() => el.remove(), 350);
  }, 2400);
}

const adapters: PlatformAdapter[] = [
  new LeetCodeAdapter(),
  new GeeksforGeeksAdapter(),
  new CodeChefAdapter(),
  new HackerRankAdapter(),
];

const active = adapters.find((adapter) => adapter.isPage());
if (active) {
  active.observe((submission) => {
    if (chrome?.runtime?.id) {
      showSyncToast();
      chrome.runtime.sendMessage({ type: 'SUBMISSION_ACCEPTED', submission });
    }
  });
}
