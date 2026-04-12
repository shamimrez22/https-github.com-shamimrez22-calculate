import { Transaction, Budget, AppNotification, UserSettings, UserProfile, Task, SavingsGoal, Subscription, Asset } from '../types';

const STORAGE_KEYS = {
  USERS: 'fintrack_users',
  CURRENT_USER: 'fintrack_current_user',
  DATA_PREFIX: 'fintrack_data_'
};

class StorageService {
  private getStorageData<T>(key: string, defaultValue: T): T {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  }

  private setStorageData<T>(key: string, data: T): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // Auth
  getCurrentUser(): UserProfile | null {
    const user = this.getStorageData<UserProfile | null>(STORAGE_KEYS.CURRENT_USER, null);
    
    // Migration: If user exists but has no role, and is the only user, make them admin
    if (user && !user.role) {
      const users = this.getStorageData<Record<string, { profile: UserProfile, password: string }>>(STORAGE_KEYS.USERS, {});
      const userCount = Object.keys(users).length;
      
      if (userCount <= 1) {
        user.role = 'admin';
        user.isLocked = false;
        this.setCurrentUser(user);
        
        // Update in users list
        const username = user.username;
        if (users[username]) {
          users[username].profile = user;
          this.setStorageData(STORAGE_KEYS.USERS, users);
        }
      } else {
        user.role = 'user';
        user.isLocked = false;
        this.setCurrentUser(user);
      }
    }
    
    return user;
  }

  setCurrentUser(user: UserProfile | null): void {
    this.setStorageData(STORAGE_KEYS.CURRENT_USER, user);
    window.dispatchEvent(new Event('auth-change'));
  }

  register(username: string, email: string, password: string): UserProfile {
    const users = this.getStorageData<Record<string, { profile: UserProfile, password: string }>>(STORAGE_KEYS.USERS, {});

    if (users[username]) {
      throw new Error('Username already taken');
    }

    // Check if email is already taken
    const emailExists = Object.values(users).some(u => u.profile?.email?.toLowerCase() === email.toLowerCase());
    if (emailExists) {
      throw new Error('Email already registered');
    }

    const uid = Math.random().toString(36).substring(2, 15);
    
    // First user becomes admin
    const isFirstUser = Object.keys(users).length === 0;
    
    const profile: UserProfile = {
      uid,
      username,
      email,
      currency: 'USD',
      createdAt: new Date().toISOString(),
      role: isFirstUser ? 'admin' : 'user',
      isLocked: false
    };

    users[username] = { profile, password };
    this.setStorageData(STORAGE_KEYS.USERS, users);
    
    // Initialize empty data for new user
    this.setUserData(uid, {
      transactions: [],
      budgets: [],
      notifications: [],
      tasks: [],
      goals: [],
      subscriptions: [],
      assets: [],
      settings: {
        uid,
        notificationsEnabled: true,
        soundEnabled: true,
        vibrationEnabled: true,
        quietHours: { enabled: false, start: '22:00', end: '07:00' }
      }
    });

    return profile;
  }

  login(username: string, password: string): UserProfile {
    const users = this.getStorageData<Record<string, { profile: UserProfile, password: string }>>(STORAGE_KEYS.USERS, {});
    const user = users[username];

    if (!user || user.password !== password) {
      throw new Error('Invalid username or password');
    }

    if (user.profile.isLocked) {
      throw new Error('Account is locked. Please contact administrator.');
    }

    this.setCurrentUser(user.profile);
    return user.profile;
  }

  // Admin methods
  getAllUsers(): UserProfile[] {
    const users = this.getStorageData<Record<string, { profile: UserProfile, password: string }>>(STORAGE_KEYS.USERS, {});
    return Object.values(users).map(u => u.profile);
  }

  toggleUserLock(uid: string): void {
    const users = this.getStorageData<Record<string, { profile: UserProfile, password: string }>>(STORAGE_KEYS.USERS, {});
    const userEntry = Object.entries(users).find(([_, u]) => u.profile.uid === uid);
    
    if (userEntry) {
      const [username, data] = userEntry;
      data.profile.isLocked = !data.profile.isLocked;
      users[username] = data;
      this.setStorageData(STORAGE_KEYS.USERS, users);
      
      // If the locked user is the current user, log them out
      const currentUser = this.getCurrentUser();
      if (currentUser && currentUser.uid === uid && data.profile.isLocked) {
        this.setCurrentUser(null);
      }
    }
  }

  updateUserPassword(uid: string, newPassword: string): void {
    const users = this.getStorageData<Record<string, { profile: UserProfile, password: string }>>(STORAGE_KEYS.USERS, {});
    const userEntry = Object.entries(users).find(([_, u]) => u.profile.uid === uid);
    
    if (userEntry) {
      const [username, data] = userEntry;
      data.password = newPassword;
      users[username] = data;
      this.setStorageData(STORAGE_KEYS.USERS, users);
    }
  }

  // User Data
  private getUserDataKey(uid: string) {
    return `${STORAGE_KEYS.DATA_PREFIX}${uid}`;
  }

  getUserData(uid: string) {
    return this.getStorageData(this.getUserDataKey(uid), {
      transactions: [] as Transaction[],
      budgets: [] as Budget[],
      notifications: [] as AppNotification[],
      tasks: [] as Task[],
      goals: [] as SavingsGoal[],
      subscriptions: [] as Subscription[],
      assets: [] as Asset[],
      settings: {
        uid,
        notificationsEnabled: true,
        soundEnabled: true,
        vibrationEnabled: true,
        quietHours: { enabled: false, start: '22:00', end: '07:00' }
      } as UserSettings
    });
  }

  setUserData(uid: string, data: any) {
    this.setStorageData(this.getUserDataKey(uid), data);
    window.dispatchEvent(new Event('data-change'));
  }

  updateProfile(uid: string, updates: Partial<UserProfile>) {
    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.uid === uid) {
      const updated = { ...currentUser, ...updates };
      this.setCurrentUser(updated);
      
      // Update in users list too
      const users = this.getStorageData<Record<string, { profile: UserProfile, password: string }>>(STORAGE_KEYS.USERS, {});
      const currentUsername = currentUser.username;
      const nextUsername = updates.username || currentUser.username;
      
      if (updates.username && nextUsername !== currentUsername) {
        if (users[nextUsername]) throw new Error('Username already taken');
        const userData = users[currentUsername];
        delete users[currentUsername];
        users[nextUsername] = { ...userData, profile: updated };
      } else {
        users[currentUsername].profile = updated;
      }
      this.setStorageData(STORAGE_KEYS.USERS, users);
    }
  }

  updatePassword(uid: string, newPassword: string) {
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      const users = this.getStorageData<Record<string, { profile: UserProfile, password: string }>>(STORAGE_KEYS.USERS, {});
      const currentUsername = currentUser.username;
      if (users[currentUsername]) {
        users[currentUsername].password = newPassword;
        this.setStorageData(STORAGE_KEYS.USERS, users);
      }
    }
  }

  deleteAccount(uid: string) {
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      const users = this.getStorageData<Record<string, { profile: UserProfile, password: string }>>(STORAGE_KEYS.USERS, {});
      delete users[currentUser.username];
      this.setStorageData(STORAGE_KEYS.USERS, users);
      localStorage.removeItem(this.getUserDataKey(uid));
      this.setCurrentUser(null);
    }
  }
}

export const storage = new StorageService();
