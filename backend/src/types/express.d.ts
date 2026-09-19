import type { User } from "@prisma/client";

// authmiddleware sets USERID; middleware/auth.ts sets user.
declare global {
  namespace Express {
    interface Request {
      USERID?: string;
      user?: User;
    }
  }
}

export {};
