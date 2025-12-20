// src/services/elementService.ts
import { BACKEND_URL } from "@/config";
import axios from "axios";

const API = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    authorization: `Bearer ${localStorage.getItem("authToken")}`,
  },
});

export const backgroundService = {
  // GET /admin/background
  list: async () => {
    const res = await API.get("/backgrounds");
    return res.data as {
      id: string;
      Url: string;
    }[];
  },

  // POST /admin/background
  create: async (payload: { Url: string }) => {
    const res = await API.post("/admin/background", payload);
    debugger;
    return res.data.id as string;
  },

  // PUT /admin/background/:id
  update: async (id: string, payload: { Url: string }) => {
    const res = await API.put(`/admin/background/${id}`, payload);
    return res.data.id as string;
  },
};
