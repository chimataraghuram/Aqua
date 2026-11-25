import type { Submission } from '../../shared/types';
import { queryText, readEditorCode, type PlatformAdapter } from '../types';

export class LeetCodeAdapter implements PlatformAdapter {
  readonly platform = 'leetcode' as const;
  private last = '';

  isPage(): boolean {
    return (
      location.hostname === 'leetcode.com' &&
      location.pathname.startsWith('/problems/')
    );
  }

  submission(): Submission | null {
    const status = queryText([
      '[data-e2e-locator="submission-result"]',
      '[data-cy="submission-result"]',
      '.text-lc-green-s',
    ]);
    if (!/accepted/i.test(status)) return null;

    const slug = location.pathname.split('/').filter(Boolean)[1] || '';
    const title =
      queryText([
        '[data-e2e-locator="question-title"]',
        '[data-cy="question-title"]',
        'h1',
      ]) || slug.replaceAll('-', ' ');
    const code = readEditorCode();
    if (!slug || !code) return null;

    return {
      platform: this.platform,
      title,
      slug,
      url: location.href.split('?')[0] || location.href,
      id: (slug.match(/^\d+/) || [])[0],
      difficulty: queryText([
        '[data-difficulty]',
        'div[class*="text-difficulty"]',
      ]),
      language:
        queryText([
          'button[data-e2e-locator="lang-selector-button"]',
          '[data-cy="lang-select"]',
          'button[class*="lang"]',
        ]) || 'text',
      code,
      timestamp: Date.now(),
    };
  }

  observe(send: (submission: Submission) => void): void {
    new MutationObserver(() => {
      const submission = this.submission();
      const key = submission ? `${submission.slug}:${submission.code}` : '';
      if (submission && key !== this.last) {
        this.last = key;
        send(submission);
      }
    }).observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  }
}
