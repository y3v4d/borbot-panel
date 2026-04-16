import { createMemo, createEffect } from "solid-js";
import { createStore } from "solid-js/store";
import { diff } from "./utils";

export function createForm<T extends object>(source: () => T) {
  const [state, setState] = createStore<T>(structuredClone(source()));
  const changes = createMemo(() => {
    return diff(source(), state);
  });

  createEffect(() => {
    setState(structuredClone(source()));
  });

  const reset = () => setState(structuredClone(source()));

  return {
      state,
      setState,
      changes,
      reset
  };
}