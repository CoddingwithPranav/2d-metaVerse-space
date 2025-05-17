import e, { Router } from "express";
import { userMiddleware } from "../../middleware/user";
import { AddElementSchema, CreateElementSchema, CreateSpaceSchema, DeleteElementSchema } from "../../types";
import { dbClient } from "@repo/db/client";
export const spaceRouter = Router();

spaceRouter.post("/", userMiddleware, async (req, res) => {
    try {
        const parsedData = CreateSpaceSchema.safeParse(req.body)
    if (!parsedData.success) {
        res.status(400).json({message: "Validation failed"})
        return
    }

    if (!parsedData.data.mapId) {
        const space = await dbClient.space.create({
            data: {
                name: parsedData.data.name,
                width: parseInt(parsedData.data.dimensions.split("x")[0]??"0"),
                height: parseInt(parsedData.data.dimensions.split("x")[1] ??"0"),
                creatorId: req.userId!
            }
        });
        res.json({spaceId: space.id})
        return;
    }
    
    const map = await dbClient.map.findFirst({
        where: {
            id: parsedData.data.mapId
        }, select: {
            elements: true,
            width: true,
            height: true
        }
    })
    if (!map) {
        res.status(400).json({message: "Map not found"})
        return
    }
    let space = await dbClient.$transaction(async () => {
        const space = await dbClient.space.create({
            data: {
                name: parsedData.data.name,
                width: map.width,
                height: map.height,
                creatorId: req.userId!,
            }
        });

        await dbClient.spaceElements.createMany({
            data: map.elements.map(e => ({
                spaceId: space.id,
                elementId: e.elementId,
                x: e.x!,
                y: e.y!
            }))
        })

        return space;

    })
    res.json({spaceId: space.id})
    } catch (error) {
        res.status(500).json({message: "Internal server error"});
    }
})


spaceRouter.delete("/element",userMiddleware, async (req, res) => {
  try {
    const parsedData = DeleteElementSchema.safeParse(req.body)
    if (!parsedData.success) {
        res.status(400).json({message: "Validation failed"})
        return
    }
    const spaceElement = await dbClient.spaceElements.findFirst({
        where: {
            id: parsedData.data.id
        }, 
        include: {
            space: true
        }
    })
    if (!spaceElement?.space.creatorId || spaceElement.space.creatorId !== req.userId) {
        res.status(403).json({message: "Unauthorized"})
        return
    }
    await dbClient.spaceElements.delete({
        where: {
            id: parsedData.data.id
        }
    })
    res.json({message: "Element deleted"})
  } catch (error) {
    res.status(500).json({message: "Internal server error", error: error});
    
  }
})

spaceRouter.delete("/:spaceId", userMiddleware, async(req, res) => {
   try {
    const space = await dbClient.space.findUnique({
        where: {
            id: req.params.spaceId
        }, select: {
            creatorId: true
        }
    })
    if (!space) {
        res.status(401).json({message: "Space not found"})
        return
    }

    if (space.creatorId !== req.userId) {
        console.log("code should reach here")
        res.status(403).json({message: "Unauthorized"})
        return
    }

    await dbClient.space.delete({
        where: {
            id: req.params.spaceId
        }
    })
    res.json({message: "Space deleted"})
   } catch (error) {
    res.status(500).json({message: "Internal server error", error: error});
    
   }
})

spaceRouter.get("/all", userMiddleware, async (req, res) => {
   try {
    const spaces = await dbClient.space.findMany({
        where: {
            creatorId: req.userId!
        }
    });

    res.json({
        spaces: spaces.map(s => ({
            id: s.id,
            name: s.name,
            thumbnail: s.thumbnail,
            dimensions: `${s.width}x${s.height}`,
        }))
    })

    
   } catch (error) {
    res.status(500).json({message: "Internal server error", error: error});
    
   }
    
})

spaceRouter.post("/element", userMiddleware, async (req, res) => {
    try {
        const parsedData = AddElementSchema.safeParse(req.body)
    if (!parsedData.success) {
        res.status(400).json({message: "Validation failed"})
        return
    }
    const space = await dbClient.space.findUnique({
        where: {
            id: req.body.spaceId,
            creatorId: req.userId!
        }, select: {
            width: true,
            height: true
        }
    })

    if(req.body.x < 0 || req.body.y < 0 || req.body.x > space?.width! || req.body.y > space?.height!) {
        res.status(400).json({message: "Point is outside of the boundary"})
        return
    }

    if (!space) {
        res.status(400).json({message: "Space not found"})
        return
    }
    await dbClient.spaceElements.create({
        data: {
            spaceId: req.body.spaceId,
            elementId: req.body.elementId,
            x: req.body.x,
            y: req.body.y
        }
    })

    res.json({message: "Element added"})
    } catch (error) {
        res.status(500).json({message: "Internal server error", error: error});
        
    }
})

spaceRouter.get("/:spaceId",async (req, res) => {
    try {
        const space = await dbClient.space.findUnique({
            where: {
                id: req.params.spaceId
            },
            include: {
                elements: {
                    include: {
                        mapElement: true
                    }
                },
            }
        })
    
        if (!space) {
            res.status(400).json({message: "Space not found"})
            return
        }
    
        res.json({
            "dimensions": `${space.width}x${space.height}`,
            elements: space.elements.map(e => ({
                id: e.id,
                element: {
                    id: e.mapElement.id,
                    imageUrl: e.mapElement.imageUrl,
                    width: e.mapElement.width,
                    height: e.mapElement.height,
                    static: e.mapElement.static
                },
                x: e.x,
                y: e.y
            })),
        })
    } catch (error) {
        res.status(500).json({message: "Internal server error", error: error});
        
    }
})