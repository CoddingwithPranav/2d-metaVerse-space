import { Router } from "express";
import { z } from "zod";
import { dbClient } from "@repo/db/client";
import { AdminMiddleware } from "../../middleware/admin";

// Define Zod schemas for validation
const IdleUrlsSchema = z.object({
  down: z.string().url("Invalid URL"),
  left: z.string().url("Invalid URL"),
  right: z.string().url("Invalid URL"),
  up: z.string().url("Invalid URL"),
});

const RunUrlsSchema = z.object({
  down: z.string().url("Invalid URL"),
  left: z.string().url("Invalid URL"),
  right: z.string().url("Invalid URL"),
  up: z.string().url("Invalid URL"),
});

const CreateAvatarSchema = z.object({
  name: z.string().min(1, "Name is required"),
  idleUrls: IdleUrlsSchema,
  runUrls: RunUrlsSchema,
});

export const useAvatar = Router();

// Route to create an avatar (POST /avatar)
useAvatar.post("/", AdminMiddleware, async (req, res) => {
  try {
    const parseResult = CreateAvatarSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ message: "Validation Error", errors: parseResult.error.errors });
    }
    const { name, idleUrls, runUrls } = parseResult.data;

    const avatar = await dbClient.avatar.create({
      data: {
        name,
        Idle_downUrl: idleUrls.down,
        Idle_leftUrl: idleUrls.left,
        Idle_rightUrl: idleUrls.right,
        Idle_upUrl: idleUrls.up,
        Run_downUrl: runUrls.down,
        Run_leftUrl: runUrls.left,
        Run_rightUrl: runUrls.right,
        Run_upUrl: runUrls.up,
      },
    });

    return res.status(200).json({ message: "Avatar created", avatar });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// Route to get all avatars (GET /avatars)
useAvatar.get("/", async (req, res) => {
  try {
    const avatars = await dbClient.avatar.findMany();
    res.json({
      avatars: avatars.map((avatar) => ({
        id: avatar.id,
        name: avatar.name,
        idleUrls: {
          down: avatar.Idle_downUrl,
          left: avatar.Idle_leftUrl,
          right: avatar.Idle_rightUrl,
          up: avatar.Idle_upUrl,
        },
        runUrls: {
          down: avatar.Run_downUrl,
          left: avatar.Run_leftUrl,
          right: avatar.Run_rightUrl,
          up: avatar.Run_upUrl,
        },
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Route to get avatars by user IDs (POST /avatar/bulk)
useAvatar.post("/bulk", async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "ids must be a non-empty array" });
    }

    const avatars = await dbClient.avatar.findMany({
      where: {
        user: {
          some: {
            id: { in: ids },
          },
        },
      },
    });

    const response = avatars.map((avatar) => ({
      id: avatar.id,
      name: avatar.name,
      idleUrls: {
        down: avatar.Idle_downUrl,
        left: avatar.Idle_leftUrl,
        right: avatar.Idle_rightUrl,
        up: avatar.Idle_upUrl,
      },
      runUrls: {
        down: avatar.Run_downUrl,
        left: avatar.Run_leftUrl,
        right: avatar.Run_rightUrl,
        up: avatar.Run_upUrl,
      },
    }));

    res.json({ avatars: response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// New route to get avatar by user ID (GET /avatar/by-user/:userId)
useAvatar.get("/by-user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("Fetching avatar for user ID:", userId);
    const avatar = await dbClient.avatar.findFirst({
      where: {
        user: {
          some: {
            id: userId,
          },
        },
      },
    });

    if (!avatar) {
      return res.status(404).json({ message: "Avatar not found for this user" });
    }

    res.json({
      avatar: {
        id: avatar.id,
        name: avatar.name,
        idleUrls: {
          down: avatar.Idle_downUrl,
          left: avatar.Idle_leftUrl,
          right: avatar.Idle_rightUrl,
          up: avatar.Idle_upUrl,
        },
        runUrls: {
          down: avatar.Run_downUrl,
          left: avatar.Run_leftUrl,
          right: avatar.Run_rightUrl,
          up: avatar.Run_upUrl,
        },
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});