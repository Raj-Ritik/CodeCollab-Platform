import { PrismaClient, UserType } from "@prisma/client";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { v4 as uuid } from "uuid";
import type { Request, Response } from "express";

const prisma = new PrismaClient();

// Validation schemas
const userSigninSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const userSignupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["STUDENT", "TEACHER"]),
});

// Signin controller
export const signin = async (req: Request, res: Response): Promise<void> => {
  try {
    const value = await userSigninSchema.parseAsync(req.body);

    const user = await prisma.user.findFirst({
      where: { email: value.email },
    });

    if (!user) {
      res.status(404).json({
        message: "User not found",
      });
      return;
    }

    if (user.password !== value.password) {
      res.status(401).json({
        message: "Invalid password",
      });
      return;
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string);

    res.json({
      message: "User logged in successfully",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.type,
      },
    });
    return;
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({
        message: err.errors[0].message,
      });
      return;
    }
    res.status(500).json({
      message: "Internal server error",
    });
    return;
  }
};

// Signup controller
export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const value = await userSignupSchema.parseAsync(req.body);

    const existingUser = await prisma.user.findFirst({
      where: { email: value.email },
    });

    if (existingUser) {
      res.status(400).json({
        message: "Email already registered",
      });
      return;
    }

    // The schema has no `role` column and `id` has no default, so both are
    // mapped explicitly here rather than spreading the request body.
    const user = await prisma.user.create({
      data: {
        id: uuid(),
        name: value.name,
        email: value.email,
        password: value.password,
        roll: "",
        type: value.role === "STUDENT" ? UserType.STUDENT : UserType.TEACHER,
      },
    });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string);

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.type,
      },
    });
    return;
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({
        message: err.errors[0].message,
      });
      return;
    }
    res.status(500).json({
      message: "Internal server error",
    });
    return;
  }
};

// Get all users
export const getUsers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        type: true,
      },
    });
    res.json(users);
    return;
  } catch (err) {
    res.status(500).json({
      message: "Internal server error",
    });
    return;
  }
};

// Update user
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body as {
      name?: string;
      email?: string;
      role?: UserType;
    };

    const user = await prisma.user.update({
      where: { id },
      data: { name, email, type: role },
    });

    res.json({
      message: "User updated successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.type,
      },
    });
    return;
  } catch (err) {
    res.status(500).json({
      message: "Internal server error",
    });
    return;
  }
};

// Delete user
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.user.delete({
      where: { id },
    });
    res.json({
      message: "User deleted successfully",
    });
    return;
  } catch (err) {
    res.status(500).json({
      message: "Internal server error",
    });
    return;
  }
};
