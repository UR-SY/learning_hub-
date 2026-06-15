"use client";

import { useEffect, useRef } from "react";
import { useGameStore } from "@/lib/store";

export function StoreInitializer() {
  const loadStats = useGameStore((state) => state.loadStats);
  const checkStreak = useGameStore((state) => state.checkStreak);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      const init = async () => {
        await loadStats();
        await checkStreak();
      };
      init();
    }
  }, [loadStats, checkStreak]);

  return null;
}
