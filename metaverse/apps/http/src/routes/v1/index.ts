import { Router } from "express";
import { dbClient } from "@repo/db/client";
import { SigninSchema, SignupSchema } from "../../types";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_PASSWORD } from "../../config";
import { adminRouter } from "./admin";
import { spaceRouter } from "./space";
import { userRouter } from "./user";
export const router = Router();

router.post("/signup",async (req, res)=>{
    const parsedData = SignupSchema.safeParse(req.body)
    if(!parsedData.success){  

        return res.status(400).json({message:"Validation Failed"})
    }

    const hashedPassword = await bcrypt.hash(parsedData.data.password, 10)
    try{
     const user = await  dbClient.user.create({
        data:{
            username: parsedData.data.username,
            password: hashedPassword,
            role: parsedData.data.role === "admin" ? "Admin" : "User",
        }
     })
     res.json({
        userId: user.id,
    })

    }catch(error){
    console.log(error)

        return res.status(400).json({message:"User Already Exists"})
    }

})

router.post("/signin", async (req, res)=>{
    const parsedData = SigninSchema.safeParse(req.body)
    if(!parsedData.success){
        return res.status(400).json({message:"Validation Failed"})
    }
    try {
       const user = await dbClient.user.findUnique({
            where:{
                username: parsedData.data.username
            }
        })
        if(!user){
            return res.status(403).json({message:"User Not Found"})
        }
        const isValid = await bcrypt.compare(parsedData.data.password, user.password)
        if(!isValid){
            return res.status(400).json({message:"Invalid Password"})
        }
        const token = jwt.sign({
            id: user.id,
            username: user.username,
            role: user.role,
        }, JWT_PASSWORD as string, {
            expiresIn: "10h"
        })
        res.json({
            token
        })
    } catch (error) {
        res.status(400).json({message:"Internal Server Error"})
    }
})

router.get("/elements",async(req, res)=>{
  try {
    const elements = await dbClient.element.findMany();
    res.json({
      elements: elements.map((element) => ({
        id: element.id,
        imageUrl: element.imageUrl,
        with: element.width,
        height: element.height,
        static: element.static,
      })),
    });   
  } catch (error) {
    res.status(400).json({message:"Internal Server Error"})
    
  }
})

router.get("/avatars",async (req,res)=>{
  try {
   const avatars =await  dbClient.avatar.findMany();
   res.json({
    avatars:avatars.map((avatar)=>({
        id: avatar.id,
        name: avatar.name,
        imageUrl: avatar.imageUrl,
    }))
   })
  } catch (error) {
    res.status(400).json({message:"Internal Server Error"})
  }
})


router.use("/user", userRouter);
router.use("/space", spaceRouter);
router.use("/admin", adminRouter);
