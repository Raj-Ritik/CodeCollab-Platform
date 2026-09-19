import { atom } from "recoil";
import type { Classroom } from "@/types";

export const roomId = atom({
  key: "roomId",
  default: "",
});

export const name = atom({
  key: "username",
  default: "",
});

export const allclasses = atom<Classroom[]>({
  key: "allclass",
  default: [],
});

export const joinedClasses = atom<Classroom[]>({
  key: "joinedClass",
  default: [],
});

export const insideClassRoom = atom({
  key: "insideClassRoom",
  default: false,
});
