import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import type { Request, Response, NextFunction } from "express";

const prisma = new PrismaClient();

interface TokenPayload {
  id: string;
}

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      res.status(401).json({
        message: "No token provided",
      });
      return;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as TokenPayload;
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      res.status(401).json({
        message: "User not found",
      });
      return;
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({
      message: "Invalid token",
    });
    return;
  }
};
