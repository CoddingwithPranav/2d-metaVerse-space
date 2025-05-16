import { NextFunction, Request, Response } from "express";
import { JWT_PASSWORD } from "../config";

const jwt = require("jsonwebtoken");
export const userMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const header = req.headers["authorization"];
  const token = header && header.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
  try {
    const decoded = jwt.verify(token, JWT_PASSWORD) as {
      role: string;
      userId: string;
    };
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
};
