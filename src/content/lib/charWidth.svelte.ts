import { createSubscriber } from "svelte/reactivity";

export class CharWidthMeasurer {
  #ctx;
  #subscribe;
  #element = $state(null as HTMLElement | null);

  constructor(element?: HTMLElement | null) {
    this.#element = element ?? null;
    this.#ctx = document.createElement("canvas").getContext("2d")!;
    this.#subscribe = createSubscriber((update) => {
      if (!element) {
        console.log("~~ observer");
        return;
      }
      console.log("+ observer");
      const observer = new ResizeObserver(update);
      observer.observe(this.#element!);
      return () => {
        observer.disconnect();
        console.log("- observer");
      };
    });
  }

  get current() {
    if (!this.#element) {
      return 10;
    }

    this.#subscribe!();

    this.#ctx!.font = getComputedStyle(this.#element!).font;
    return this.#ctx!.measureText("0").width;
  }

  set element(el: HTMLElement | null) {
    this.#element = el;
  }
}
