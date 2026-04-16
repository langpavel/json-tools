import { createSubscriber } from "svelte/reactivity";

export function useCharWidth(getEl: () => HTMLElement | null) {
  // Subscriber is recreated when getEl() returns a new element,
  // because $derived.by re-runs and constructs a fresh one.
  const charWidth = $derived.by(() => {
    const el = getEl();
    if (!el) return 0;

    const subscribe = createSubscriber((update) => {
      const observer = new ResizeObserver(update);
      observer.observe(el);
      return () => observer.disconnect();
    });

    subscribe(); // register reactive dependency on ResizeObserver ticks

    const ctx = document.createElement("canvas").getContext("2d")!;
    ctx.font = getComputedStyle(el).font;
    return ctx.measureText("M").width;
  });

  return {
    get charWidth() {
      return charWidth;
    },
  };
}
