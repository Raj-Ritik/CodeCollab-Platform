import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
dotenv.config();

interface TokenPayload {
  id: string;
}

export default async function authmiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  let token = req.headers.authorization;
  console.log(token);
  try {
    if (!token || !token.startsWith("Bearer")) {
      res.status(404).json({
        message: "user not found",
      });
      return;
    }
    token = token.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as TokenPayload;

    if (!decoded) {
      res.status(404).json({
        message: "user not found",
      });
      return;
    }

    req.USERID = decoded.id;
    next();
  } catch (err) {
    res.status(404).json({
      message: "user not found",
    });
    return;
  }
}
