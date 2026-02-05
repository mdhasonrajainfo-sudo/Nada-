export type UserRole = 'user' | 'admin';
export type AccountType = 'free' | 'premium';

export interface UserData {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  password: string;
  refCode: string;
  uplineRefCode: string;
  role: UserRole;
  accountType: AccountType;
  joiningDate: string;
  balanceFree: number;
  balancePremium: number;
  totalWithdraw: number;
  isBlocked: boolean;
  profileImage?: string;
  referralJobQuota: number; // Added for Referral Typing Jobs logic
}

export const DB_KEYS = {
  USERS: 'app_users',
  CURRENT_USER: 'app_current_user',
  SETTINGS: 'app_settings',
  TASKS: 'app_tasks'
};