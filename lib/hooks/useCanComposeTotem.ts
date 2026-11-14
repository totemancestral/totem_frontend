"use client";
import { createContext, useContext } from "react";

export const CanComposeTotemContext = createContext<boolean | null>(null);

export function useCanComposeTotem() {
  return useContext(CanComposeTotemContext);
}
