import { describe, expect, it } from 'vitest';
import { defaults, type Platform, type Submission } from '../src/shared/types';
import { commitMessage, readme, solutionPath } from '../src/shared/utils';

const sample = (platform: Platform, overrides: Partial<Submission> = {}): Submission => ({
  platform,
  title: 'Two Sum',
  slug: 'two-sum',
  url: `https://example.com/${platform}/two-sum`,
  difficulty: 'Easy',
  language: 'C++',
  code: 'int main() { return 0; }',
  timestamp: 1700000000000,
  ...overrides,
});

describe('multi-platform sync helpers', () => {
  it('builds platform-specific folder paths', () => {
    expect(solutionPath(sample('leetcode', { id: '1' }), defaults)).toBe(
      'LeetCode/0001-two-sum/0001-two-sum.cpp'
    );
    expect(solutionPath(sample('geeksforgeeks'), defaults)).toBe(
      'GeeksforGeeks/two-sum/two-sum.cpp'
    );
    expect(solutionPath(sample('codechef', { language: 'Python3' }), defaults)).toBe(
      'CodeChef/two-sum/two-sum.py'
    );
    expect(solutionPath(sample('hackerrank', { language: 'Java' }), defaults)).toBe(
      'HackerRank/two-sum/two-sum.java'
    );
  });

  it('includes the platform name in README and commit messages', () => {
    const sub = sample('geeksforgeeks', { title: 'Indexes of Subarray Sum' });
    const path = solutionPath(sub, defaults);
    expect(readme(sub, path)).toContain('- Source: GeeksforGeeks');
    expect(commitMessage(defaults.commitTemplate, sub)).toBe(
      'feat(geeksforgeeks): add Indexes of Subarray Sum solution'
    );
  });
});
