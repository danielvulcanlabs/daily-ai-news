export interface UserPreferences {
  timezone: string;
  language: 'vi' | 'en';
  digestTime: {
    morning: string; // "06:00"
    midday: string;  // "12:00"
  };
  focusAreas: string[];
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  provider: 'google' | 'github' | 'microsoft' | 'apple';
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  timezone: 'Asia/Ho_Chi_Minh',
  language: 'vi',
  digestTime: {
    morning: '06:00',
    midday: '12:00',
  },
  focusAreas: [],
};
