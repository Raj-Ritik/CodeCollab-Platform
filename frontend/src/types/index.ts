// Shared domain types, mirroring the Prisma schema and the API response shapes.

export type UserType = "STUDENT" | "TEACHER";

export type LanguageName = "javascript" | "java" | "python";

export type LanguageCode = "JS" | "JAVA" | "PYTHON";

export interface User {
  id: string;
  name: string;
  email: string;
  roll: string;
  type: UserType;
}

export interface TeacherRef {
  id: string;
  name: string;
}

export interface Classroom {
  id: string;
  name: string;
  teacherId: string;
  teacher: TeacherRef;
}

export interface ProjectOwner {
  id: string;
  name: string;
  email: string;
  roll: string;
}

export interface Project {
  id: string;
  name: string;
  userId: string;
  classId: string;
  user: ProjectOwner;
  class: { name: string };
}

export interface CodeRecord {
  id: string;
  projectId: string;
  language: LanguageCode;
  data: string;
}

export interface JoinRequest {
  id: string;
  classId: string;
  StudentId: string;
  TeacherId: string;
  state: "PENDING" | "REJECTED";
  student: { name: string; email: string; roll: string };
  class: { id: string; name: string };
}

/** A participant broadcast over the socket presence channel. */
export interface RoomUser {
  id: string;
  name: string;
  type?: string;
  [key: string]: unknown;
}

export interface ChatMessage {
  roomId: string;
  senderId: string;
  sender: string;
  text: string;
  timestamp: string;
}

/** Value provided by AuthProvider's context. */
export interface AuthContextValue {
  name: string;
  email: string;
  type: string;
  roll: string;
  id: string;
  avatar?: string;
  setName: React.Dispatch<React.SetStateAction<string>>;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  setType: React.Dispatch<React.SetStateAction<string>>;
  setRoll: React.Dispatch<React.SetStateAction<string>>;
  setId: React.Dispatch<React.SetStateAction<string>>;
}
