import type { Submission } from '../../shared/types';
import { queryText, readEditorCode, type PlatformAdapter } from '../types';

export class HackerRankAdapter implements PlatformAdapter {
  readonly platform = 'hackerrank' as const;
  private last = '';

  isPage(): boolean {
    return (
      location.hostname.endsWith('hackerrank.com') &&
      location.pathname.includes('/challenges/')
    );
  }

  submission(): Submission | null {
    const status = queryText([
      '.congratulations-wrapper',
      '.status',
      '[class*="submission-status"]',
      '.judge-status',
    ]);
    if (!/congratulations|accepted|success/i.test(status)) {
      return null;
    }

    const parts = location.pathname.split('/').filter(Boolean);
    const idx = parts.indexOf('challenges');
    const slug = (idx >= 0 ? parts[idx + 1] : parts[0]) || '';
    const title =
      queryText(['h1.ui-icon-label', 'h1.page-label', 'h1']) ||
      slug.replaceAll('-', ' ');
    const code = readEditorCode();
    if (!slug || !code) return null;

    return {
      platform: this.platform,
      title,
      slug,
      url: location.href.split('?')[0] || location.href,
      difficulty: queryText(['.difficulty-block', '[class*="difficulty"]']),
      language:
        queryText([
          '.select-language [class*="singleValue"]',
          'select[id*="language"]',
          '[data-testid="language-selector"]',
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
