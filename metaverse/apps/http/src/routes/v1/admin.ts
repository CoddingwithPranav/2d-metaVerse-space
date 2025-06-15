import { Router } from "express";
import { AdminMiddleware } from "../../middleware/admin";
import {
  CreateAvatarSchema,
  CreateElementSchema,
  CreateMapSchema,
  UpdateElementSchema,
} from "../../types";
import { dbClient } from "@repo/db/client";

export const adminRouter = Router();

adminRouter.post("/element", AdminMiddleware, async (req, res) => {
  try {
    const parsedData = CreateElementSchema.safeParse(req.body);
    if (!parsedData.success) {
      return res.status(400).json({ message: "Validation failed" });
    }
    const element = await dbClient.element.create({
      data: {
        imageUrl: parsedData.data.imageUrl,
        width: parsedData.data.width,
        height: parsedData.data.height,
        static: parsedData.data.static,
      },
    });
    res.json({
      id: element.id,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Element already exists" });
  }
});

adminRouter.put("/element/:elementId", async (req, res) => {
  try {
    const parsedData = UpdateElementSchema.safeParse(req.body);
    if (!parsedData.success) {
      return res.status(400).json({ message: "Validation failed" });
    }
    const updatedElement = await dbClient.element.update({
      where: {
        id: req.params.elementId,
      },
      data: {
        imageUrl: parsedData.data.imageUrl,
      },
    });
    res.json({
      id: updatedElement.id,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Element not found" });
  }
});

adminRouter.post("/map", AdminMiddleware, async (req, res) => {
  try {
    const parsedData = CreateMapSchema.safeParse(req.body);
    if (!parsedData.success) {
      return res
        .status(400)
        .json({
          message: "Validation failed",
          issues: parsedData.error.errors,
        });
    }

    const { name, thumbnail, width, height, defaultElements, background } =
      parsedData.data;

    const map = await dbClient.map.create({
      data: {
        name,
        thumbnail,
        width,
        height,
        backgroundId: background, // <-- set background reference
        elements: {
          create: defaultElements.map((e) => ({
            elementId: e.assetId,
            x: e.x,
            y: e.y,
            width: e.width.toString(),
            height: e.height.toString(),
          })),
        },
      },
    });

    res.json({ id: map.id });
  } catch (error) {
    console.error("Map creation failed:", error);
    res.status(500).json({ message: "Map creation failed" });
  }
});

adminRouter.post("/background", AdminMiddleware, async (req, res) => {
  const { Url } = req.body;
  if (!Url) return res.status(400).json({ message: "URL required" });

  try {
    const bg = await dbClient.background.create({
      data: { Url: Url },
    });
    res.json({ id: bg.id });
  } catch (err) {
    console.error("Error creating background:", err);
    res.status(500).json({ message: "Failed to create background" });
  }
});
