export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role?: "admin" | "publisher" | "advertiser";
  is_first_admin?: boolean;
  status?: string;
  created_at: string;
  updated_at: string;
}

export interface FeedbackFormState {
  name: string;
  email: string;
  phone: string;
  category: number;
  subject: string;
  message: string;
}

export interface UseUserDataReturn {
  profile: UserProfile | null;
  isLoading: boolean;
  isAdmin: boolean;
  error: string | null;
}
