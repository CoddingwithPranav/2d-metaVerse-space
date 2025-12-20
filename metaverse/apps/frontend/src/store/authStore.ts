import { create } from "zustand";
interface AuthState {
  token: string | null;
  role: string | null;
  setAuth: (token: string | null, role: string | null) => void;
  clearAuth: () => void;
}

export const useZustandAuth = create<AuthState>((set) => ({
  token: null,
  role: null,
  setAuth: (token, role) => set({ token, role }),
  clearAuth: () => set({ token: null, role: null }),
}));
