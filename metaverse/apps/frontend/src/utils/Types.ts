// Define the types
export interface User {
  email: string;
  role: 'admin' | 'user';
}

export interface AuthState {
  token: string | null;
  user: User | null;
  login: (data: { token: string; user: User }) => void;
  logout: () => void;
}