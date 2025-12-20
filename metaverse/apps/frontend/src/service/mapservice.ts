// src/services/mapService.ts
import { BACKEND_URL } from "@/config";
import axios from "axios";

// Type definitions matching your backend schema additions
export interface DefaultElementPlacement {
  id: string;
  assetId: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface MapItem {
  id: string;
  name: string;
  thumbnail: string;
  width: number;
  height: number;
  backgroundId: string;
  elements: DefaultElementPlacement[];
}

const API = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    authorization: `Bearer ${localStorage.getItem("authToken")}`,
  },
});

export const mapService = {
  /**
   * Fetch all maps
   */
  list: async (): Promise<MapItem[]> => {
    const res = await API.get("/maps");
    return res.data.maps as MapItem[];
  },

  /**
   * Create a new map
   */
  create: async (payload: {
    name: string;
    thumbnail: string;
    width: number;
    height: number;
    background: string;
    defaultElements: DefaultElementPlacement[];
  }): Promise<{ id: string }> => {
    const res = await API.post("/admin/map", payload);
    return { id: res.data.id as string };
  },

  /**
   * Update an existing map
   */
  update: async (
    id: string,
    payload: Partial<{
      name: string;
      thumbnail: string;
      width: number;
      height: number;
      background: string;
      defaultElements: DefaultElementPlacement[];
    }>,
  ): Promise<{ id: string }> => {
    const res = await API.put(`/admin/map/${id}`, payload);
    return { id: res.data.id as string };
  },

  /**
   * Delete a map
   */
  remove: async (id: string): Promise<void> => {
    await API.delete(`/admin/map/${id}`);
  },
};
