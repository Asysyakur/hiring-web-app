export interface AuthState {
  user: any | null;
  loading: boolean;
  error: string | null;
}

export interface Credentials {
  fullName?: string;
  email: string;
  password?: string;
}
