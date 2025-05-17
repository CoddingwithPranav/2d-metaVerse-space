import { Router } from "express";
import { AdminMiddleware } from "../../middleware/admin";
import { CreateAvatarSchema, CreateElementSchema, CreateMapSchema, UpdateElementSchema } from "../../types";
import { dbClient } from "@repo/db/client";

export const adminRouter = Router();

adminRouter.post('/element', AdminMiddleware,async(req, res)=>{
   try {
    const parsedData = CreateElementSchema.safeParse(req.body);
    if (!parsedData.success) {
        return res.status(400).json({message: "Validation failed"})
    }
    const element = await dbClient.element.create({
        data: {
            imageUrl: parsedData.data.imageUrl,
            width: parsedData.data.width,
            height: parsedData.data.height,
            static: parsedData.data.static,
        }
    })
    res.json({
        id: element.id,
    })
   } catch (error) {
    console.log(error)
    res.status(400).json({message: "Element already exists"})
   }
})

adminRouter.put("/element/:elementId",async (req,res)=>{
    try {
        const parsedData = UpdateElementSchema.safeParse(req.body);
        if (!parsedData.success) {
            return res.status(400).json({message: "Validation failed"})
        }
        const updatedElement = await dbClient.element.update({
            where: {
                id: req.params.elementId,   
            },
            data: {
                imageUrl: parsedData.data.imageUrl,
            }
        })
        res.json({
            id: updatedElement.id,
        })

    } catch (error) {
        console.log(error)
        res.status(400).json({message: "Element not found"})
    }
})
adminRouter.post("/avatar",AdminMiddleware , async (req,res)=>{
  try {
    
    const parsedData = CreateAvatarSchema.safeParse(req.body);
    if (!parsedData.success) {
        return res.status(400).json({message: "Validation failed"})
    }
    const avatar = await dbClient.avatar.create({
        data: {
            name: parsedData.data.name,
            imageUrl: parsedData.data.imageUrl,
        }
    })
    res.json({
        id: avatar.id,
    })

  } catch (error) {
    console.log(error)
    res.status(400).json({message: "Avatar already exists"})
  }
})
adminRouter.post("/map",AdminMiddleware,async (req,res)=>{
   try {
    const parsedData = CreateMapSchema.safeParse(req.body);
    if (!parsedData.success) {
        return res.status(400).json({message: "Validation failed"})
    }
    const map = await dbClient.map.create({
        data: {
            thumbnail: parsedData.data.thumbnail,
            name: parsedData.data.name,
            width: parseInt(parsedData.data.dimensions.split("x")[0] ?? "0"),
            height: parseInt(parsedData.data.dimensions.split("x")[1] ?? "0"),
            elements: {
                create: parsedData.data.defaultElements.map(e => ({
                    elementId: e.elementId,
                    x: e.x,
                    y: e.y,
                }))
            }
        }
    })
    res.json({
        id: map.id,
    })
   } catch (error) {
    console.log(error)
    res.status(400).json({message: "Map not found"})
   }
})