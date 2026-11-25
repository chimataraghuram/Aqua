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

export const readEditorCode = (): string =>
  (document.querySelector('textarea') as HTMLTextAreaElement | null)?.value ||
  document.querySelector('.monaco-editor .view-lines')?.textContent ||
  document.querySelector('.ace_text-layer')?.textContent ||
  document.querySelector('.CodeMirror-code')?.textContent ||
  '';
