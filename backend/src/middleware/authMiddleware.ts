import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

interface JwtPayload {
  id: string;
}

export interface AuthRequest extends Request {
  user?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  // Bypass auth for now per user request - inject a valid ObjectId 
  req.user = { _id: "60d0fe4f5311236168a109ca" };
  next();
};
