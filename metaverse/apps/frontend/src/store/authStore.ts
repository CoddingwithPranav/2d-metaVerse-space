// src/store/authStore.ts (Example - adjust path as per your project)
import { create } from 'zustand';

interface AuthState {
  token: string | null;
  role: string | null; // Add role state
  setAuth: (token: string | null, role: string | null) => void; // Update setAuth to accept role
  clearAuth: () => void;
}

export const useZustandAuth = create<AuthState>((set) => ({
  token: null,
  role: null, // Initialize role state
  setAuth: (token, role) => set({ token, role }), // Set both token and role
  clearAuth: () => set({ token: null, role: null }), // Clear both on logout
}));