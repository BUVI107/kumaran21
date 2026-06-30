"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAppState } from "@/context/AppStateContext";

type Requirement = "unlocked" | "gameCompleted";

/**
 * Soft route guard: if the visitor lands directly on a page deeper
 * in the experience without having unlocked the site (or finished
 * the game, where required), send them back to where the story
 * actually starts. Runs only after localStorage has hydrated, so it
 * never fires a false redirect on first paint.
 */
export function useRouteGuard(requirement: Requirement) {
  const router = useRouter();
  const { unlocked, gameCompleted, hydrated } = useAppState();

  useEffect(() => {
    if (!hydrated) return;

    if (requirement === "unlocked" && !unlocked) {
      router.replace("/");
      return;
    }

    if (requirement === "gameCompleted" && !(unlocked && gameCompleted)) {
      router.replace(unlocked ? "/game" : "/");
    }
  }, [hydrated, unlocked, gameCompleted, requirement, router]);
}
