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
  const fileName = folder.split('/').pop() || slugify(s.slug);
  const ext = languageExtensions[s.language.toLowerCase()] || '.txt';
  return safePath(`${c.rootFolder}/${folder}/${fileName}${ext}`);
};

export const readme = (s: Submission, path: string) =>
  `# [${s.title}](${s.url})\n\n### ${s.difficulty || 'Unknown'} · ${s.language} · ${platformLabel(s.platform)}\n\n${s.description ? `${s.description}\n\n` : ''}## Solution\n\nThe solution is available in [\`${path.split('/').pop()}\`](./${path.split('/').pop()}).\n`;

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

  const repoTitle = repo.split('/')[1] || 'Coding Solutions & Algorithms';

  return `<div align="center">

# 🧠 ${repoTitle}

**Maintained by [Aqua](https://github.com/chimataraghuram/Aqua)** <img src="https://raw.githubusercontent.com/chimataraghuram/Aqua/main/public/icon.svg" alt="Aqua" width="20" height="20" align="absmiddle" />

<p>
  <a href="https://leetcode.com/"><img src="https://img.shields.io/badge/LEETCODE-FFA116?style=for-the-badge&logo=leetcode&logoColor=white" alt="LeetCode" /></a>
  <a href="https://www.geeksforgeeks.org/"><img src="https://img.shields.io/badge/GEEKSFORGEEKS-2F8D46?style=for-the-badge&logo=geeksforgeeks&logoColor=white" alt="GeeksforGeeks" /></a>
  <a href="https://www.codechef.com/"><img src="https://img.shields.io/badge/CODECHEF-5B4638?style=for-the-badge&logo=codechef&logoColor=white" alt="CodeChef" /></a>
  <a href="https://www.hackerrank.com/"><img src="https://img.shields.io/badge/HACKERRANK-00EA64?style=for-the-badge&logo=hackerrank&logoColor=black" alt="HackerRank" /></a>
  <a href="https://github.com/${login}"><img src="https://img.shields.io/badge/GITHUB-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" /></a>
  <a href="https://github.com/chimataraghuram/Aqua"><img src="https://img.shields.io/badge/AQUA-0284C7?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Aqua" /></a>
</p>

<p>
  <img src="https://img.shields.io/badge/Total%20Solved-${total}-0284c7?style=flat-square" alt="Total Solved" />
  <img src="https://img.shields.io/badge/Easy-${easy}-16a34a?style=flat-square" alt="Easy" />
  <img src="https://img.shields.io/badge/Medium-${medium}-d97706?style=flat-square" alt="Medium" />
  <img src="https://img.shields.io/badge/Hard-${hard}-dc2626?style=flat-square" alt="Hard" />
</p>

> 🚀 A centralized, multi-platform repository for Data Structures & Algorithms solutions across **LeetCode**, **GeeksforGeeks**, **CodeChef**, and **HackerRank**.

</div>

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

<div align="center">

<img src="https://raw.githubusercontent.com/chimataraghuram/Aqua/main/public/icon.svg" alt="Aqua" width="32" height="32" />

### ⚡ Managed & Auto-Synced by [Aqua](https://github.com/chimataraghuram/Aqua)

*Code More. Manage Less. · Solve. Flow. Sync.*

Built by **TechBoy (CHIMATA RAGHURAM)** · [GitHub](https://github.com/chimataraghuram) · [LinkedIn](https://www.linkedin.com/in/chimataraghuram/) · [Aqua Extension](https://github.com/chimataraghuram/Aqua)

<sub>Synced repository: \`${repo}\`</sub>

</div>
`;
};
