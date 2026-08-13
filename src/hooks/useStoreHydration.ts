import { useEffect, useState } from 'react';

import { useAppStore } from '@/store/useAppStore';

/**
 * Tracks Zustand persist hydration. Handles the race where rehydration finishes
 * before `onFinishHydration` is subscribed, and avoids an infinite spinner if
 * storage rejects (persist middleware does not always finish hydration on error).
 */
export function useStoreHydration(): boolean {
  const [hydrated, setHydrated] = useState(() => useAppStore.persist.hasHydrated());

  useEffect(() => {
    if (useAppStore.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }

    const unsub = useAppStore.persist.onFinishHydration(() => setHydrated(true));

    const raf = requestAnimationFrame(() => {
      if (useAppStore.persist.hasHydrated()) setHydrated(true);
    });

    const safety = setTimeout(() => {
      if (!useAppStore.persist.hasHydrated()) {
        console.warn('[The Real Math] Persist hydration did not complete; continuing with defaults.');
      }
      setHydrated(true);
    }, 2500);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(safety);
      unsub();
    };
  }, []);

  return hydrated;
}
