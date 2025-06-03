import express from "express";
import cors from "cors";
import { router } from "./routes/v1";
import { PORT } from "./config";
import dotenv from "dotenv";
dotenv.config();

const app = express();

// Apply CORS middleware before any routes
app.use(cors({
  origin: "*", // ⚠️ In production, set this to a specific domain
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use("/api/v1", router);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


