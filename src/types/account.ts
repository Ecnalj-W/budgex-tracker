export type AccountProfile = {
  userId?: string;
  displayName: string;
  email: string;
  provider?: 'email' | 'google';
};

export type AppSettings = {
  autoSyncOnOpen: boolean;
  syncOnWifiOnly: boolean;
  darkMode: boolean;
};
