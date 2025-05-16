import { Router } from "express";
import { UpdateMetadataSchema } from "../../types";
import { dbClient } from "@repo/db/client";
import { userMiddleware } from "../../middleware/user";

export const userRouter = Router();

userRouter.post("/metadata",userMiddleware, async (req, res)=>{
  const parsedData = UpdateMetadataSchema.safeParse(req.body);
  if (!parsedData.success) {
    return res.status(400).json({
      message: "validation failed",
    });
  }

  await dbClient.user.update({
    where: {
      id: req.userId
    },
    data: {
      avatarId: parsedData.data.avatarId,
    },
  })
  return res.status(200).json({
    message: "Metadata updated",
  });
})

userRouter.get("/metadata/bulk", async (req, res)=>{
  // ids = [1,2,3,]
    const userIdString = (req.query.ids) as string;4
    const userIds = userIdString.split(",").map((id) => {
      return id.replace(/[^0-9]/g, "");
    })
   try{
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
    })
    return res.status(200).json({
      avatars:metadata.map(m=>{
        return {
          userId: m.id,
          username: m.username,
          avatarId: m.avatarId,
        }
      })
    });
   } catch(error){
    return res.status(400).json({
      message: "User Not Found",
    });
    }
})