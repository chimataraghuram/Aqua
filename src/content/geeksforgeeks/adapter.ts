import type { Submission } from '../../shared/types';
import { queryText, readEditorCode, type PlatformAdapter } from '../types';

export class GeeksforGeeksAdapter implements PlatformAdapter {
  readonly platform = 'geeksforgeeks' as const;
  private last = '';

  isPage(): boolean {
    return (
      location.hostname.endsWith('geeksforgeeks.org') &&
      location.pathname.includes('/problems/')
    );
  }

  submission(): Submission | null {
    const status = queryText([
      '.problems_content__status__text',
      '[class*="success"]',
      '.ui.green.message',
      '[data-testid="submission-status"]',
    ]);
    if (!/problem solved successfully|correct answer|accepted/i.test(status)) {
      return null;
    }

    const parts = location.pathname.split('/').filter(Boolean);
    const idx = parts.indexOf('problems');
    const slug = (idx >= 0 ? parts[idx + 1] : parts[0]) || '';
    const title =
      queryText(['h3[class*="g-m-0"]', '.problems_header_content__title h3', 'h1']) ||
      slug.replaceAll('-', ' ');
    const code = readEditorCode();
    if (!slug || !code) return null;

    return {
      platform: this.platform,
      title,
      slug,
      url: location.href.split('?')[0] || location.href,
      difficulty: queryText([
        '.problems_header_description__level',
        '[class*="difficulty"]',
      ]),
      language:
        queryText([
          '[class*="problems_language_dropdown"] .divider.text',
          '.problems_language_dropdown__select',
          'button[class*="language"]',
          'select[name*="lang"]',
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
