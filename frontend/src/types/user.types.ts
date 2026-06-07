export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string | null;
  is_active: boolean;
  is_approved: boolean;
  role: string;
  created_at: string;
  updated_at?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
