import { NextFunction, Request, Response } from "express";
import { JWT_PASSWORD } from "../config";

const jwt = require("jsonwebtoken");
export const AdminMiddleware = (
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
      id: string;
    };
    if(decoded.role !== "Admin") {
      return res.status(403).json({
        message: "Forbidden",
      });
    }
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
};
