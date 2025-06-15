import z from "zod";

export const SignupSchema = z.object({
    username: z.string(),
    password: z.string(),
    role: z.enum(["user", "admin"]),
    avatarId: z.string().optional(), 
})

export const SigninSchema = z.object({
    username: z.string(),
    password: z.string(),
})

export const UpdateMetadataSchema = z.object({
    avatarId: z.string()
})


export const CreateSpaceSchema = z.object({
  name: z.string(),
  mapId: z.string().optional(),
  dimensions: z.string().optional(),
}).refine((data) => data.mapId || data.dimensions, {
  message: "Either mapId or dimensions must be provided",
  path: ["dimensions", "mapId"],
});



export const DeleteElementSchema = z.object({
    id: z.string(),
})

export const AddElementSchema = z.object({
    spaceId: z.string(),
    elementId: z.string(),
    x: z.number(),
    y: z.number(),
})

export const CreateElementSchema = z.object({
    imageUrl: z.string(),
    width: z.number(),
    height: z.number(),
    static: z.boolean(),
})

export const UpdateElementSchema = z.object({
    imageUrl: z.string(),
})

export const CreateAvatarSchema = z.object({
    name: z.string(),
    imageUrl: z.string(),
})


export const CreateMapSchema = z.object({
  background: z.string(), // background ID
  thumbnail: z.string(),
  name: z.string(),
  width: z.number().min(1).max(10000),
  height: z.number().min(1).max(10000),
  defaultElements: z.array(z.object({
    id: z.string(),        // Unique element ID on the canvas
    assetId: z.string(),   // ID of the asset used
    x: z.number(),         // Position X
    y: z.number(),         // Position Y
    width: z.number(),     // Width of the element
    height: z.number(),    // Height of the element
  }))
});


declare global {
    namespace Express {
      export interface Request {
        role?: "Admin" | "User";
        userId?: string;
      }
    }
}