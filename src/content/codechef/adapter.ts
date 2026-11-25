import type { Submission } from '../../shared/types';
import { queryText, readEditorCode, type PlatformAdapter } from '../types';

export class CodeChefAdapter implements PlatformAdapter {
  readonly platform = 'codechef' as const;
  private last = '';

  isPage(): boolean {
    return (
      location.hostname.endsWith('codechef.com') &&
      (location.pathname.includes('/problems/') ||
        location.pathname.includes('/submit/'))
    );
  }

  submission(): Submission | null {
    const status = queryText([
      '[class*="status-text"]',
      '[class*="verdict"]',
      '.correct-answer',
      '[data-testid="verdict"]',
    ]);
    if (!/correct answer|\baccepted\b|\bac\b/i.test(status)) {
      return null;
    }

    const parts = location.pathname.split('/').filter(Boolean);
    const idx = parts.indexOf('problems');
    const slug = (idx >= 0 ? parts[idx + 1] : parts[parts.length - 1]) || '';
    const title =
      queryText([
        'div[class*="problemBodyContent"] h3',
        'h1',
        '[class*="problem-title"]',
        '.title',
      ]) || slug;
    const code = readEditorCode();
    if (!slug || !code) return null;

    return {
      platform: this.platform,
      title,
      slug,
      url: location.href.split('?')[0] || location.href,
      difficulty: queryText([
        'div[class*="difficulty-ratings__box"] span[class*="value"]',
        '[class*="difficulty"]',
        '.difficulty-rating',
      ]),
      language:
        queryText([
          '#language-select',
          '[class*="language-select"]',
          'select[id*="language"]',
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
