import { CodeChefAdapter } from './codechef/adapter';
import { GeeksforGeeksAdapter } from './geeksforgeeks/adapter';
import { HackerRankAdapter } from './hackerrank/adapter';
import { LeetCodeAdapter } from './leetcode/adapter';
import type { PlatformAdapter } from './types';

const adapters: PlatformAdapter[] = [
  new LeetCodeAdapter(),
  new GeeksforGeeksAdapter(),
  new CodeChefAdapter(),
  new HackerRankAdapter(),
];

const active = adapters.find((adapter) => adapter.isPage());
if (active) {
  active.observe((submission) =>
    chrome.runtime.sendMessage({ type: 'SUBMISSION_ACCEPTED', submission })
  );
}
