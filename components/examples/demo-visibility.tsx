"use client"
import { createContext, useContext } from "react"
// Local examples only; this never changes service or portable runtime authority.
export const DemoVisibility = createContext(true)
export function useDemoVisibility() {
  return useContext(DemoVisibility)
}
