import { Router } from "express";
import { UpdateMetadataSchema } from "../../types";
import { dbClient } from "@repo/db/client";
import { userMiddleware } from "../../middleware/user";

export const userRouter = Router();

userRouter.post("/metadata", userMiddleware, async (req, res) => {
  try {
    const parsedData = UpdateMetadataSchema.safeParse(req.body);
    if (!parsedData.success) {
      return res.status(400).json({
        message: "validation failed",
      });
    }

    await dbClient.user.update({
      where: {
        id: req.userId,
      },
      data: {
        avatarId: parsedData.data.avatarId,
      },
    });
    return res.status(200).json({
      message: "Metadata updated",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: "User not found",
    });
  }
});

userRouter.get("/metadata/bulk", async (req, res) => {
  // ids = [1,2,3,]
  try {
    // Get the ids query param, which could be a string or an array
    const rawIds = req.query.ids;
    let userIds: string[] = [];

    if (Array.isArray(rawIds)) {
      // Example: ?ids[]=id1&ids[]=id2
      userIds = rawIds.flatMap((id: any) =>
        id
          .replace(/[\[\]]/g, "") // remove square brackets
          .split(",")
          .map((item: any) => item.trim())
      );
    } else if (typeof rawIds === "string") {
      // Example: ?ids=[id1,id2] or ?ids=id1,id2
      userIds = rawIds
        .replace(/[\[\]]/g, "") // remove square brackets
        .split(",")
        .map((id) => id.trim());
    }

    // Remove any empty values
    userIds = userIds.filter((id) => id.length > 0);

    const metadata = await dbClient.user.findMany({
      where: {
        id: {
          in: userIds,
        },
      },
      select: {
        id: true,
        username: true,
        avatarId: true,
      },
    });
    return res.status(200).json({
      avatars: metadata.map((m) => {
        return {
          userId: m.id,
          username: m.username,
          avatarId: m.avatarId,
        };
      }),
    });
  } catch (error) {
    return res.status(400).json({
      message: "User Not Found",
    });
  }
});
