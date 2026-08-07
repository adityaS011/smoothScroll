"use client";

import { useEffect, useState } from "react";

export function useLocalStorageDismiss(key: string) {
  const [dismissed, setDismissed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setDismissed(window.localStorage.getItem(key) === "true");
    setHydrated(true);
  }, [key]);

  function dismiss() {
    setDismissed(true);
    window.localStorage.setItem(key, "true");
  }

  return { dismissed, hydrated, dismiss };
}
