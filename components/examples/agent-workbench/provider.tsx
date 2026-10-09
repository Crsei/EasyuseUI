"use client"
import {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
  type Dispatch,
} from "react"
import {
  exampleReducer,
  initialExample,
  type ExampleAction,
  type ExampleState,
} from "./reducer"
const Context = createContext<{
  state: ExampleState
  dispatch: Dispatch<ExampleAction>
} | null>(null)
export function WorkbenchExampleProvider({
  children,
}: {
  children: ReactNode
}) {
  const [state, dispatch] = useReducer(
    exampleReducer,
    undefined,
    initialExample,
  )
  return (
    <Context.Provider value={{ state, dispatch }}>{children}</Context.Provider>
  )
}
export function useWorkbenchExample() {
  const value = useContext(Context)
  if (!value) throw new Error("WorkbenchExampleProvider is required")
  return value
}
