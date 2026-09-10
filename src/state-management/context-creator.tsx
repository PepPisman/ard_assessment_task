"use client";

import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from "react";

interface StateContextBundle<TState, TAction> {
  Provider: (props: { children: ReactNode }) => ReactNode;
  useStateContext: () => TState;
  useDispatchContext: () => Dispatch<TAction>;
}

export function createStateContext<TState, TAction>(
  reducer: (state: TState, action: TAction) => TState,
  initialState: TState,
): StateContextBundle<TState, TAction> {
  const StateContext = createContext<TState | undefined>(undefined);
  const DispatchContext = createContext<Dispatch<TAction> | undefined>(undefined);

  function Provider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(reducer, initialState);

    return (
      <StateContext.Provider value={state}>
        <DispatchContext.Provider value={dispatch}>{children}</DispatchContext.Provider>
      </StateContext.Provider>
    );
  }

  function useStateContext(): TState {
    const context = useContext(StateContext);

    if (context === undefined) {
      throw new Error("State context used outside of its Provider");
    }

    return context;
  }

  function useDispatchContext(): Dispatch<TAction> {
    const context = useContext(DispatchContext);

    if (context === undefined) {
      throw new Error("Dispatch context used outside of its Provider");
    }

    return context;
  }

  return { Provider, useStateContext, useDispatchContext };
}
