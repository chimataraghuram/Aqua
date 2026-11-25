export type Platform = 'leetcode' | 'geeksforgeeks' | 'codechef' | 'hackerrank';
export type DuplicateBehavior = 'update' | 'skip' | 'ask';

export interface Settings {
  githubClientId: string;
  repository?: string;
  branch?: string;
  rootFolder: string;
  platformFolders: boolean;
  enabledPlatforms: Record<Platform, boolean>;
  includeId: boolean;
  includeReadme: boolean;
  languageFolders: boolean;
  difficultyFolders: boolean;
  autoSync: boolean;
  duplicateBehavior: DuplicateBehavior;
  commitTemplate: string;
  notifySuccess: boolean;
  notifyFailure: boolean;
  debug: boolean;
  darkMode?: boolean;
}

export interface Submission {
  platform?: Platform;
  title: string;
  slug: string;
  url: string;
  id?: string;
  difficulty?: string;
  language: string;
  code: string;
  timestamp: number;
}

export interface SyncRecord {
  id: string;
  submission: Submission;
  status: 'success' | 'failed' | 'pending' | 'skipped';
  path?: string;
  commitSha?: string;
  error?: string;
  timestamp: number;
}

export interface Auth {
  token: string;
  login: string;
}

export const defaults: Settings = {
  githubClientId: '',
  rootFolder: '',
  platformFolders: true,
  enabledPlatforms: {
    leetcode: true,
    geeksforgeeks: true,
    codechef: true,
    hackerrank: true,
  },
  includeId: true,
  includeReadme: true,
  languageFolders: false,
  difficultyFolders: false,
  autoSync: true,
  duplicateBehavior: 'update',
  commitTemplate: 'feat({platform}): add {problem} solution',
  notifySuccess: true,
  notifyFailure: true,
  debug: false,
};

export type Message =
  | { type: 'GET_STATE' }
  | { type: 'SAVE_SETTINGS'; settings: Settings }
  | { type: 'CONNECT_GITHUB' }
  | { type: 'CONNECT_PAT'; token: string }
  | { type: 'DISCONNECT_GITHUB' }
  | { type: 'GET_REPOS' }
  | { type: 'CREATE_REPO'; name: string; isPrivate: boolean; includeReadme?: boolean }
  | { type: 'GET_BRANCHES'; repository: string }
  | { type: 'SYNC'; submission: Submission }
  | { type: 'RETRY'; id: string }
  | { type: 'SUBMISSION_ACCEPTED'; submission: Submission }
  | { type: 'LEETCODE_ACCEPTED'; submission: Submission };

export const isMessage = (x: unknown): x is Message =>
  !!x &&
  typeof x === 'object' &&
  typeof (x as { type?: unknown }).type === 'string' &&
  [
    'GET_STATE',
    'SAVE_SETTINGS',
    'CONNECT_GITHUB',
    'CONNECT_PAT',
    'DISCONNECT_GITHUB',
    'GET_REPOS',
    'CREATE_REPO',
    'GET_BRANCHES',
    'SYNC',
    'RETRY',
    'SUBMISSION_ACCEPTED',
    'LEETCODE_ACCEPTED',
  ].includes((x as { type: string }).type);
