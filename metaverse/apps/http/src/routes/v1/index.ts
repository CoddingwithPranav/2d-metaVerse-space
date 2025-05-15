import { Router } from "express";
import { userRouter } from "./user";
import { spaceRouter } from "./space";
import { adminRouter } from "./admin";
import { dbClient } from "@repo/db/client";
import { SigninSchema, SignupSchema } from "../../types";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_PASSWORD } from "../../config";
export const router = Router();

router.post("/signup",async (req, res)=>{
    const parsedData = SignupSchema.safeParse(req.body)
    if(!parsedData.success){    console.log(parsedData)

        return res.status(400).json({message:"Validation Failed"})
    }

    const hashedPassword = await bcrypt.hash(parsedData.data.password, 10)
    try{
     const user = await  dbClient.user.create({
        data:{
            username: parsedData.data.username,
            password: hashedPassword,
            role: parsedData.data.type === "admin" ? "Admin" : "User",
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

router.get("/elements",(req, res)=>{

})

router.get("/avatars",(req,res)=>{

})


router.use("/user", userRouter);
router.use("/space", spaceRouter);
router.use("/admin", adminRouter);
