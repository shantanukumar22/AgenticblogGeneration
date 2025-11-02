export interface User {
  id: number;
  email: string;
  username: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Blog {
  id: number;
  user_id: number;
  topic: string;
  title: string | null;
  content: string;
  created_at: string;
  updated_at: string;
}
