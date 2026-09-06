import { useEffect, useRef, useState } from "react";

const THRESHOLD = 70;
const MAX_PULL = 100;

// Touch-only pull-to-refresh: tracks a downward drag starting from the top
// of the nearest scrollable <main> ancestor, and fires onRefresh() once the
// drag is released past THRESHOLD. Returns live pull state for a visual
// indicator; does not render anything itself.
export default function usePullToRefresh(onRefresh) {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(null);
  const distanceRef = useRef(0);
  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  useEffect(() => {
    const handleTouchStart = (e) => {
      const main = e.target.closest("main");
      if (!main || main.scrollTop > 0 || refreshing) {
        startY.current = null;
        return;
      }
      startY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      if (startY.current == null) return;
      const delta = e.touches[0].clientY - startY.current;
      const next = delta > 0 ? Math.min(delta, MAX_PULL) : 0;
      distanceRef.current = next;
      setPullDistance(next);
    };

    const handleTouchEnd = async () => {
      if (startY.current == null) return;
      startY.current = null;
      if (distanceRef.current >= THRESHOLD) {
        setRefreshing(true);
        setPullDistance(0);
        try {
          await onRefreshRef.current?.();
        } finally {
          setRefreshing(false);
        }
      } else {
        setPullDistance(0);
      }
      distanceRef.current = 0;
    };

    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchmove", handleTouchMove, { passive: true });
    document.addEventListener("touchend", handleTouchEnd);
    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [refreshing]);

  return { pullDistance, refreshing, threshold: THRESHOLD };
}
