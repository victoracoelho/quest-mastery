import { Settings } from '@/types';
import { getItem, setItem } from '@/lib/storage';

const SETTINGS_KEY = 'settings';

const DEFAULT_SETTINGS: Omit<Settings, 'userId'> = {
  cardsPorDia: 3,
  questoesPorTopico: 10, // Fixed, not configurable
};

export function getAllSettings(): Settings[] {
  return getItem<Settings[]>(SETTINGS_KEY) || [];
}

export function getSettingsByUser(userId: string): Settings {
  const allSettings = getAllSettings();
  const userSettings = allSettings.find(s => s.userId === userId);
  
  if (userSettings) {
    return userSettings;
  }
  
  // Create default settings for new user
  const newSettings: Settings = {
    userId,
    ...DEFAULT_SETTINGS,
  };
  allSettings.push(newSettings);
  setItem(SETTINGS_KEY, allSettings);
  return newSettings;
}

export function updateSettings(userId: string, updates: Partial<Omit<Settings, 'userId' | 'questoesPorTopico'>>): Settings {
  const allSettings = getAllSettings();
  const idx = allSettings.findIndex(s => s.userId === userId);
  
  if (idx !== -1) {
    allSettings[idx] = { ...allSettings[idx], ...updates };
    setItem(SETTINGS_KEY, allSettings);
    return allSettings[idx];
  }
  
  // Create new settings if not found
  const newSettings: Settings = {
    userId,
    ...DEFAULT_SETTINGS,
    ...updates,
  };
  allSettings.push(newSettings);
  setItem(SETTINGS_KEY, allSettings);
  return newSettings;
}
