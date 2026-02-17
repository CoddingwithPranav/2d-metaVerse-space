import { BACKEND_URL } from "@/config";
import axios from "axios";

const API = axios.create({ baseURL: BACKEND_URL });

export const spaceService = {
  myspace: async () => {
    const token = localStorage.getItem("authToken");
    const res = await API.get("/space/all", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  },
  allMap: async () => {
    const token = localStorage.getItem("authToken");
    const res = await API.get("/maps", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  },
};
