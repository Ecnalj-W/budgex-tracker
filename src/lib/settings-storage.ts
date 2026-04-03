import AsyncStorage from '@react-native-async-storage/async-storage';

import type { AccountProfile, AppSettings } from '../types/account';

const PROFILE_STORAGE_KEY = 'budgex:account-profile';
const SETTINGS_STORAGE_KEY = 'budgex:app-settings';

const defaultProfile: AccountProfile = {
  displayName: '',
  email: '',
};

const defaultSettings: AppSettings = {
  autoSyncOnOpen: false,
  syncOnWifiOnly: true,
  darkMode: false,
};

export const loadAccountProfile = async () => {
  const stored = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);

  if (!stored) {
    return defaultProfile;
  }

  return {
    ...defaultProfile,
    ...(JSON.parse(stored) as Partial<AccountProfile>),
  };
};

export const saveAccountProfile = async (profile: AccountProfile) => {
  await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
};

export const loadAppSettings = async () => {
  const stored = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);

  if (!stored) {
    return defaultSettings;
  }

  return {
    ...defaultSettings,
    ...(JSON.parse(stored) as Partial<AppSettings>),
  };
};

export const saveAppSettings = async (settings: AppSettings) => {
  await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
};
