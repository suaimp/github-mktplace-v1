// src/pages/auth/types/validation.ts

export interface ValidationErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phone?: string;
  accountType?: string;
  terms?: string;
}
