import { BACKEND_URL } from '@/config';
import { useZustandAuth } from '@/store/authStore';
import axios from 'axios';

const API = axios.create({ baseURL: BACKEND_URL });
// const { token, role } = useZustandAuth.getState(); // ✅ This works outside of React
const token = localStorage.getItem('authToken');

export const authService = {
  login: async (email: string, password: string) => {
    const res = await API.post('/signin', { username: email, password, role: "admin" });
    return res.data;
  },
  imageToken: async () => {
    const res = await API.get('/image-auth');
    return res.data;
  },
  register: async (email: string, password: string) => {
    const res = await API.post('/signup', { username: email, password, role: "admin" });
    return res.data;
  },
  profile: async () => {
    const res = await API.get('/user/profile', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  },
    /** 
   * Updates the current user's profile.
   * @param data.displayName  new display name
   * @param data.profileImage URL of the uploaded profile image
   */
    updateProfile: async (data: { displayName: string; profileImage?: string }) => {
      const { token } = useZustandAuth.getState();
      const res = await API.post(
        '/user/profile/update',
        {
          displayName: data.displayName,
          profileImage: data.profileImage,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // res.data: { message: string; user: { id; displayName; profileImage } }
      return res.data;
    },
};
