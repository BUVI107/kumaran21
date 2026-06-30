"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface AppState {
  /** True once the correct password has been entered this session. */
  unlocked: boolean;
  /** True once the car game has been completed or skipped. */
  gameCompleted: boolean;
  /** True once localStorage has been read on the client. */
  hydrated: boolean;
  setUnlocked: (value: boolean) => void;
  setGameCompleted: (value: boolean) => void;
}

const STORAGE_KEY = "kumaran21:progress";

const AppStateContext = createContext<AppState | null>(null);

interface StoredProgress {
  unlocked: boolean;
  gameCompleted: boolean;
}

function readStoredProgress(): StoredProgress {
  if (typeof window === "undefined") {
    return { unlocked: false, gameCompleted: false };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { unlocked: false, gameCompleted: false };
    const parsed = JSON.parse(raw) as Partial<StoredProgress>;
    return {
      unlocked: Boolean(parsed.unlocked),
      gameCompleted: Boolean(parsed.gameCompleted),
    };
  } catch {
    return { unlocked: false, gameCompleted: false };
  }
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [unlocked, setUnlockedState] = useState(false);
  const [gameCompleted, setGameCompletedState] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = readStoredProgress();
    setUnlockedState(stored.unlocked);
    setGameCompletedState(stored.gameCompleted);
    setHydrated(true);
  }, []);

  const persist = useCallback((next: StoredProgress) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Storage can fail (private browsing, quota). The experience
      // still works for the current session either way.
    }
  }, []);

  const setUnlocked = useCallback(
    (value: boolean) => {
      setUnlockedState(value);
      persist({ unlocked: value, gameCompleted });
    },
    [gameCompleted, persist]
  );

  const setGameCompleted = useCallback(
    (value: boolean) => {
      setGameCompletedState(value);
      persist({ unlocked, gameCompleted: value });
    },
    [unlocked, persist]
  );

  const value = useMemo<AppState>(
    () => ({
      unlocked,
      gameCompleted,
      hydrated,
      setUnlocked,
      setGameCompleted,
    }),
    [unlocked, gameCompleted, hydrated, setUnlocked, setGameCompleted]
  );

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState(): AppState {
  const ctx = useContext(AppStateContext);
  if (!ctx) {
    throw new Error("useAppState must be used within an AppStateProvider");
  }
  return ctx;
}
