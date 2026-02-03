export interface User {
  email: string;
}

export interface AuthUser extends User {
  id: number;
  roles: string[];
}

export interface LoginPayload extends User {
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  confirmPassword: string;
  agreeTerms: boolean;
}

export interface ApiAuthResponse {
  success: boolean;
  message: string;
}

export interface VerifyEmailResponse extends ApiAuthResponse {
  code: number;
}

export interface PasswordPayload {
  password: string;
  confirmPassword: string;
}