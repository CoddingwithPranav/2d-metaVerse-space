import { BACKEND_URL } from '@/config';
import axios from 'axios';

const API = axios.create({ baseURL: BACKEND_URL });

export const authService = {
  login: async (email: string, password: string) => {
    const res = await API.post('/signin', { username:email, password , role:"admin"});
    return res.data;
  },
  imageToken: async () => {
    const res = await API.get('/image-auth');
    return res.data;
  },
  register: async (email: string, password: string) => {
    const res = await API.post('/signup', { username:email, password, role:"admin" });
    return res.data;
  },
};
