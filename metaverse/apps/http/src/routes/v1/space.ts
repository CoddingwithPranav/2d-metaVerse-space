import e, { Router } from "express";
import { userMiddleware } from "../../middleware/user";
import { AddElementSchema, CreateElementSchema, CreateSpaceSchema, DeleteElementSchema } from "../../types";
import { dbClient } from "@repo/db/client";
export const spaceRouter = Router();



spaceRouter.post("/", userMiddleware, async (req, res) => {
  try {
    const parsed = CreateSpaceSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Validation failed", issues: parsed.error.errors });
    }

    const { name, mapId, dimensions } = parsed.data;

    // No mapId: create space with custom dimensions
    if (!mapId) {
      const [w, h] = dimensions!.split("x").map((v) => parseInt(v, 10));
      const space = await dbClient.space.create({
        data: {
          name,
          width: w ?? 0,
          height: h,
          creatorId: req.userId!,
        },
      });
      return res.json({ spaceId: space.id });
    }

    // With mapId: fetch mapElements and map dimensions
    const map = await dbClient.map.findUnique({
      where: { id: mapId },
      select: {
        width: true,
        height: true,
        thumbnail: true,
        background:true,
        elements: {
          select: {
            elementId: true,
            x: true,
            y: true,
            width: true,
            height: true,
          },
        },
      },
    });
    if (!map) {
      return res.status(400).json({ message: "Map not found" });
    }
    // Create space and copy elements
    const space = await dbClient.$transaction(async () => {
      const newSpace = await dbClient.space.create({
        data: {
          name,
          width: map.width,
          height: map.height,
          backgroundUrl:map.background?.Url,
          thumbnail: map.thumbnail,
          creatorId: req.userId!,
        },
      });

      await dbClient.spaceElements.createMany({
        data: map.elements.map((e) => ({
          spaceId: newSpace.id,
          elementId: e.elementId,
          x: e.x || 0,
          y: e.y || 0,
          width: e.width.toString(),
          height: e.height.toString(),
        })),
      });

      return newSpace;
    });

    return res.json({ spaceId: space.id });
  } catch (error) {
    console.error("Error creating space:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});




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

  spaceRouter.get("/:spaceId", async (req, res) => {
      try {
        const space = await dbClient.space.findUnique({
          where: {
            id: req.params.spaceId,
          },
          include: {
            elements: {
              select: {
                id: true,
                x: true,
                y: true,
                mapElement: {
                  select: {
                    id: true,
                    imageUrl: true,
                    width: true,
                    height: true,
                    static: true,
                  },
                },
              },
            },
          },
        });
    
        if (!space) {
          res.status(400).json({ message: "Space not found" });
          return;
        }
    
        res.json({
          dimensions: `${space.width}x${space.height}`,
          backgroundUrl: space.backgroundUrl,
          elements: space.elements.map(e => ({
            id: e.id,
            element: {
              id: e.mapElement.id,
              imageUrl: e.mapElement.imageUrl,
              width: e.mapElement.width,
              height: e.mapElement.height,
              static: e.mapElement.static,
            },
            x: e.x,
            y: e.y,
          })),
        });
      } catch (error) {
        console.error("Error fetching space:", error);
        res.status(500).json({ message: "Internal server error", error });
      }
    });
  
  
