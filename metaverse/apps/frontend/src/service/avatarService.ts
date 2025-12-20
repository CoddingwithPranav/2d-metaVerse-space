import { BACKEND_URL } from "@/config";
import axios from "axios";

const API = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    authorization: `Bearer ${localStorage.getItem("authToken")}`,
  },
});

interface IdleUrls {
  down: string;
  left: string;
  right: string;
  up: string;
}

interface RunUrls {
  down: string;
  left: string;
  right: string;
  up: string;
}

export interface Avatar {
  id: string;
  name: string;
  idleUrls: IdleUrls;
  runUrls: RunUrls;
}

export const avatarService = {
  list: async (): Promise<Avatar[]> => {
    const res = await API.get("/avatar");
    return res.data.avatars;
  },

  getByUserId: async (userId: string): Promise<Avatar | null> => {
    try {
      const res = await API.get(`/avatar/by-user/${userId}`);
      return res.data.avatar;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  create: async (payload: {
    name: string;
    idleUrls: IdleUrls;
    runUrls: RunUrls;
  }): Promise<string> => {
    const res = await API.post("/avatar", payload);
    return res.data.avatar.id;
  },
};
