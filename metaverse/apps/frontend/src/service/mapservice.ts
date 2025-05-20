// src/services/mapService.ts
import { BACKEND_URL } from '@/config';
import axios from 'axios';

// Type definitions matching your backend schema
export interface DefaultElementPlacement {
  elementId: string;
  x: number;
  y: number;
}

export interface MapItem {
  id: string;
  name: string;
  thumbnail: string;
  dimensions: string;
  defaultElements: DefaultElementPlacement[];
}

const API = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    authorization: `Bearer ${localStorage.getItem('authToken')}`,
  },
});

export const mapService = {
  /**
   * Fetch all maps
   */
  list: async (): Promise<MapItem[]> => {
    const res = await API.get('/maps');
    return res.data.maps as MapItem[];
  },

  /**
   * Create a new map
   */
  create: async (payload: {
    name: string;
    thumbnail: string;
    dimensions: string;
    defaultElements: DefaultElementPlacement[];
  }): Promise<string> => {
    const res = await API.post('admin/map', payload);
    return res.data.id as string;
  },

  /**
   * Update an existing map
   */
  update: async (
    id: string,
    payload: Partial<{
      name: string;
      thumbnail: string;
      dimensions: string;
      defaultElements: DefaultElementPlacement[];
    }>
  ): Promise<string> => {
    const res = await API.put(`admin/map/${id}`, payload);
    return res.data.id as string;
  },

  /**
   * Delete a map
   */
  remove: async (id: string): Promise<void> => {
    await API.delete(`admin/map/${id}`);
  },
};
