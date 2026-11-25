import type { Platform, Settings, Submission, SyncRecord } from './types';

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

export const repoReadme = (
  login: string,
  repo: string,
  records: SyncRecord[] = []
) => {
  const unique = new Map<string, SyncRecord>();
  for (const r of records) {
    if (r.status === 'success') {
      const k = `${r.submission.platform || 'leetcode'}:${r.submission.slug}`;
      if (!unique.has(k)) unique.set(k, r);
    }
  }
  const list = Array.from(unique.values());
  const total = list.length;
  const platCount = (p: Platform) =>
    list.filter((r) => (r.submission.platform || 'leetcode') === p).length;
  const diffCount = (d: string) =>
    list.filter((r) =>
      (r.submission.difficulty || '').toLowerCase().includes(d)
    ).length;
  const pct = (n: number) => (total ? `${((n / total) * 100).toFixed(1)}%` : '0.0%');
  const easy = diffCount('easy');
  const medium = diffCount('medium');
  const hard = diffCount('hard');

  const rows = list
    .map((r, i) => {
      const p = platformLabel(r.submission.platform);
      const d = r.submission.difficulty || 'Unknown';
      const sol = r.path ? `[Solution](${r.path})` : '-';
      return `| ${i + 1} | [${r.submission.title}](${r.submission.url}) | ${p} | ${d} | ${r.submission.language} | ${sol} |`;
    })
    .join('\n');

  return `# 🧠 Coding Solutions & Algorithms

Maintained by **@${login}**

A centralized, multi-platform repository for Data Structures & Algorithms solutions across **LeetCode**, **GeeksforGeeks**, **CodeChef**, and **HackerRank**.

## 🌐 Platforms & Structure

| Platform | Solved | Status |
| --- | ---: | --- |
| LeetCode | ${platCount('leetcode')} | ${platCount('leetcode') > 0 ? '🟢 Active' : '🟡 Ready'} |
| GeeksforGeeks | ${platCount('geeksforgeeks')} | ${platCount('geeksforgeeks') > 0 ? '🟢 Active' : '🟡 Ready'} |
| CodeChef | ${platCount('codechef')} | ${platCount('codechef') > 0 ? '🟢 Active' : '🟡 Ready'} |
| HackerRank | ${platCount('hackerrank')} | ${platCount('hackerrank') > 0 ? '🟢 Active' : '🟡 Ready'} |

## 📊 Progress

| Difficulty | Solved | Ratio |
| --- | ---: | ---: |
| 🟢 Easy | ${easy} | ${pct(easy)} |
| 🟡 Medium | ${medium} | ${pct(medium)} |
| 🔴 Hard | ${hard} | ${pct(hard)} |
| 🏆 **Total** | **${total}** | **100%** |

## 📚 Solved Problems Catalog

<details>
<summary>Click to view all ${total} solved problems</summary>

| # | Problem | Platform | Difficulty | Language | Solution |
| ---: | --- | --- | --- | --- | --- |
${rows || '| - | No problems synced yet | - | - | - | - |'}

</details>

<details>
<summary>🏷️ Click to browse problems by Platform</summary>

${(['leetcode', 'geeksforgeeks', 'codechef', 'hackerrank'] as Platform[])
  .map((plat) => {
    const items = list.filter((r) => (r.submission.platform || 'leetcode') === plat);
    const links = items
      .map((r) => `- [${r.submission.title}](${r.submission.url}) (${r.submission.language})`)
      .join('\n');
    return `### ${platformLabel(plat)} (${items.length})\n${links || '- *No problems synced yet*'}`;
  })
  .join('\n\n')}

</details>

---

*Auto-synced via **Aqua** by TechBoy (CHIMATA RAGHURAM) · \`${repo}\`*
`;
};
