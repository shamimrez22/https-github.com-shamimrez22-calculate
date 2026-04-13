export interface UserProfile {
  uid: string;
  username: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  currency: string;
  monthlyBudget?: number;
  createdAt: string;
  role: 'admin' | 'user';
  isLocked: boolean;
}

export interface Transaction {
  id?: string;
  uid: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
  note?: string;
  createdAt: string;
}

export interface Budget {
  id?: string;
  uid: string;
  category: string;
  limit: number;
  period: "monthly";
}

export interface AppNotification {
  id?: string;
  uid: string;
  title: string;
  message: string;
  type: "budget_exceeded" | "budget_warning" | "reminder" | "ai_insight" | "goal_progress" | "task_reminder";
  read: boolean;
  createdAt: string;
}

export interface Task {
  id?: string;
  uid: string;
  title: string;
  notes?: string;
  scheduledAt: string;
  completed: boolean;
  priority: "high" | "medium" | "low";
  repeat: "none" | "daily" | "weekly";
  createdAt: string;
}

export interface SavingsGoal {
  id: string;
  uid: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  category: string;
  createdAt: string;
}

export interface Subscription {
  id: string;
  uid: string;
  name: string;
  amount: number;
  frequency: "monthly" | "yearly";
  nextBillingDate: string;
  category: string;
  active: boolean;
  createdAt: string;
}

export interface Asset {
  id: string;
  uid: string;
  name: string;
  type: "Stock" | "Crypto" | "Real Estate" | "Gold" | "Other";
  value: number;
  purchasePrice: number;
  quantity: number;
  createdAt: string;
}

export interface UserSettings {
  uid: string;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

export type Category = 
  | "Food" 
  | "Transport" 
  | "Shopping" 
  | "Bills" 
  | "Entertainment" 
  | "Health" 
  | "Salary" 
  | "Business" 
  | "Savings"
  | "Other";
