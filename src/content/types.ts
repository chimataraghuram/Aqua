import type { Platform, Submission } from '../shared/types';

export interface PlatformAdapter {
  readonly platform: Platform;
  isPage(): boolean;
  observe(send: (submission: Submission) => void): void;
}

export const queryText = (selectors: string[]): string =>
  selectors
    .map((selector) => document.querySelector(selector)?.textContent?.trim() || '')
    .find(Boolean) || '';

export const readEditorCode = (): string => {
  const ta = (document.querySelector('textarea') as HTMLTextAreaElement | null)?.value;
  if (ta && ta.trim().length > 0) return ta;

  const monacoLines = Array.from(document.querySelectorAll('.monaco-editor .view-line'));
  if (monacoLines.length > 0) {
    return monacoLines.map((l) => l.textContent || '').join('\n');
  }

  const aceLines = Array.from(document.querySelectorAll('.ace_text-layer .ace_line'));
  if (aceLines.length > 0) {
    return aceLines.map((l) => l.textContent || '').join('\n');
  }

  const cmLines = Array.from(document.querySelectorAll('.CodeMirror-code .CodeMirror-line'));
  if (cmLines.length > 0) {
    return cmLines.map((l) => l.textContent || '').join('\n');
  }

  return '';
};
