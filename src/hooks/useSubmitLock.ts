"use client";

import { useRef, useTransition } from "react";

export function useSubmitLock() {
  const lockRef = useRef(false);
  const [isPending, startTransition] = useTransition();

  function run(action: () => void | Promise<void>) {
    if (lockRef.current || isPending) {
      return;
    }

    lockRef.current = true;

    startTransition(async () => {
      try {
        await action();
      } finally {
        lockRef.current = false;
      }
    });
  }

  return { isPending, run, isLocked: isPending };
}
