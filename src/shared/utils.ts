import type { Platform, Settings, Submission } from './types';

export const languageExtensions: Record<string, string> = {
  python: '.py',
  python3: '.py',
  pypy: '.py',
  pypy3: '.py',
  java: '.java',
  'c++': '.cpp',
  cpp: '.cpp',
  'c++17': '.cpp',
  'c++20': '.cpp',
  c: '.c',
  javascript: '.js',
  typescript: '.ts',
  go: '.go',
  rust: '.rs',
  kotlin: '.kt',
  swift: '.swift',
  php: '.php',
  ruby: '.rb',
  'c#': '.cs',
  csharp: '.cs',
  dart: '.dart',
  scala: '.scala',
};

const platformNames: Record<Platform, string> = {
  leetcode: 'LeetCode',
  geeksforgeeks: 'GeeksforGeeks',
  codechef: 'CodeChef',
  hackerrank: 'HackerRank',
};

export const platformLabel = (platform?: Platform): string =>
  platform ? platformNames[platform] : 'LeetCode';

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export const safePath = (p: string) => {
  const x = p.replace(/\\/g, '/').split('/').filter(Boolean);
  if (x.some((v) => v === '.' || v === '..' || /[<>:"|?*\x00-\x1f]/.test(v))) {
    throw new Error('Invalid GitHub path');
  }
  return x.join('/');
};

export const solutionPath = (s: Submission, c: Settings) => {
  let folder =
    c.includeId && s.id
      ? `${s.id.padStart(4, '0')}-${slugify(s.slug)}`
      : slugify(s.slug);
  if (c.difficultyFolders && s.difficulty) {
    folder = `${slugify(s.difficulty)}/${folder}`;
  }
  if (c.languageFolders) {
    folder = `${slugify(s.language)}/${folder}`;
  }
  if (c.platformFolders) {
    folder = `${platformLabel(s.platform)}/${folder}`;
  }
  const ext = languageExtensions[s.language.toLowerCase()] || '.txt';
  return safePath(`${c.rootFolder}/${folder}/solution${ext}`);
};

export const readme = (s: Submission, path: string) =>
  `# ${s.title}\n\n- Problem: ${s.title}\n- Difficulty: ${s.difficulty || 'Unknown'}\n- Language: ${s.language}\n- Source: ${platformLabel(s.platform)}\n- Problem URL: ${s.url}\n\n## Solution\n\nThe solution is available in \`${path.split('/').pop()}\`.\n\n## Complexity\n\nComplexity analysis not automatically determined.\n`;

export const commitMessage = (t: string, s: Submission) =>
  t
    .replaceAll('{problem}', s.title)
    .replaceAll('{language}', s.language)
    .replaceAll('{platform}', platformLabel(s.platform).toLowerCase());

export const repoReadme = (login: string, repo: string) =>
  `# 🧠 Coding Solutions & Algorithms\n\nMaintained by **@${login}**\n\nA centralized, multi-platform repository for Data Structures & Algorithms solutions across **LeetCode**, **GeeksforGeeks**, **CodeChef**, and **HackerRank**.\n\n---\n\n*Auto-synced via **Aqua** by TechBoy (CHIMATA RAGHURAM) · \`${repo}\`*\n`;
