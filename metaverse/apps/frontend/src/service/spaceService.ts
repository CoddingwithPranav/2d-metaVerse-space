import { BACKEND_URL } from '@/config';
import axios from 'axios';

const API = axios.create({ baseURL: BACKEND_URL });
const token = localStorage.getItem('authToken');

export const spaceService = {
  myspace: async () => {
    const res = await API.get('/space/all', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  },
  allMap: async () => {
    const res = await API.get('/maps', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  },
};
