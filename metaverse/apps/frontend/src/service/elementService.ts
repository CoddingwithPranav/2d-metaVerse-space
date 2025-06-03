// src/services/elementService.ts
import { BACKEND_URL } from '@/config';
import axios from 'axios';
const API = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    authorization: `Bearer ${localStorage.getItem('authToken')}`,
  },
});

export const elementService = {
  // GET /elements
  list: async () => {
    const res = await API.get('/elements');
    return res.data.elements as {
      id: string;
      imageUrl: string;
      width: number;
      height: number;
      static: boolean;
    }[];
  },

  // POST /element
  create: async (payload: {
    imageUrl: string;
    width: number;
    height: number;
    static: boolean;
  }) => {
    const res = await API.post('admin/element', payload);
    return res.data.id as string;
  },

  // PUT /element/:id
  update: async (
    id: string,
    payload: { imageUrl: string }
  ) => {
    const res = await API.put(`admin/element/${id}`, payload);
    return res.data.id as string;
  },
};
