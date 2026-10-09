"use client"
import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
  type Dispatch,
} from "react"
import {
  exampleReducer,
  initialExample,
  type ExampleAction,
  type ExampleState,
} from "./reducer"
import {
  readPanelPreferences,
  savePanelPreferences,
  removePanelPreferences,
} from "./showcase-model"
import { initialWorkbench } from "./fixtures"
const Context = createContext<{
  state: ExampleState
  dispatch: Dispatch<ExampleAction>
  clearPanelPreferences: () => void
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
  const skipSave = useRef(true)
  useEffect(() => {
    const saved = readPanelPreferences()
    if (saved)
      dispatch({
        type: "panels",
        panels: { ...initialWorkbench().panels, ...saved },
      })
  }, [])
  useEffect(() => {
    if (skipSave.current) {
      skipSave.current = false
      return
    }
    savePanelPreferences(state.panels)
  }, [state.panels])
  const clearPanelPreferences = useCallback(() => {
    removePanelPreferences()
    skipSave.current = true
    dispatch({ type: "panels", panels: initialWorkbench().panels })
  }, [])
  return (
    <Context.Provider value={{ state, dispatch, clearPanelPreferences }}>
      {children}
    </Context.Provider>
  )
}
export function useWorkbenchExample() {
  const value = useContext(Context)
  if (!value) throw new Error("WorkbenchExampleProvider is required")
  return value
}
