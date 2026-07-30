import { useEffect, useRef } from "react";

export function useAutoScroll() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let frame = 0;
    let lastTime = performance.now();
    let active = false;
    const speedPxPerSecond = 80;
    const resetThreshold = 20;

    const updateLimits = () => {
      const limit = Math.max(el.scrollHeight - el.clientHeight, 0);
      if (limit <= 0) {
        active = false;
        el.scrollTop = 0;
        return 0;
      }

      if (el.scrollTop > limit) {
        el.scrollTop = 0;
      }

      active = true;
      return limit;
    };

    const tick = (now: number) => {
      if (!el) return;

      const deltaMs = now - lastTime;
      lastTime = now;
      const limit = updateLimits();

      if (!active || limit <= 0) {
        frame = requestAnimationFrame(tick);
        return;
      }

      const step = (deltaMs / 1000) * speedPxPerSecond;
      const nextTop = el.scrollTop + step;

      if (nextTop >= limit - resetThreshold) {
        el.scrollTop = 0;
      } else {
        el.scrollTop = nextTop;
      }

      frame = requestAnimationFrame(tick);
    };

    const startLoop = () => {
      lastTime = performance.now();
      updateLimits();
      if (active) {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(tick);
      }
    };

    startLoop();

    const resizeObserver = new ResizeObserver(startLoop);
    resizeObserver.observe(el);

    const mutationObserver = new MutationObserver(startLoop);
    mutationObserver.observe(el, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    window.addEventListener("resize", startLoop);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener("resize", startLoop);
    };
  }, []);

  return ref;
}