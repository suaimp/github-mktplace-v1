/**
 * Types and interfaces for Privacy Policy feature
 * Segue o princípio de responsabilidade única - apenas tipos relacionados à privacy policy
 */

export interface PrivacyPolicyData {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface PrivacyPolicyState {
  privacyPolicy: PrivacyPolicyData | null;
  loading: boolean;
  error: string | null;
}

export interface UsePrivacyPolicyReturn {
  privacyPolicy: PrivacyPolicyData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  retryLoad: () => void;
}
