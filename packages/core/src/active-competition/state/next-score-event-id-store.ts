import { createStore } from "@tanstack/store";

export type NextScoreEventIdState = number;

export function createNextScoreEventIdStore() {
  const store = createStore<NextScoreEventIdState>(1);

  function setId(id: number): void {
    store.setState(() => id);
  }

  function consume(): number {
    const id = store.state;
    store.setState((prev) => prev + 1);
    return id;
  }

  return { store, setId, consume };
}

export type NextScoreEventIdStore = ReturnType<typeof createNextScoreEventIdStore>;
