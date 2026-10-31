import { flushSync } from "react-dom";

/** Reveal a destination before measuring it for a jump or focusing it. */
export function revealSection(target: HTMLElement) {
  const scope = target.closest("[data-izk-section-scope]");
  const clear = scope?.querySelector<HTMLButtonElement>("[data-izk-clear-search]");
  if (clear) flushSync(() => clear.click());
  // Some older jump destinations wrap a card rather than identify it.
  const destination = target.hasAttribute("data-izk-foldable")
    ? target : target.querySelector<HTMLElement>("[data-izk-foldable]") ?? target;
  flushSync(() => {
    for (let node: HTMLElement | null = destination; node; node = node.parentElement) {
      if (!node.hasAttribute("data-izk-foldable")) continue;
      const toggle = node.querySelector<HTMLButtonElement>(":scope > div [data-izk-section-toggle]");
      if (toggle?.getAttribute("aria-expanded") === "false") toggle.click();
    }
  });
}

export function foldSections(root: HTMLElement, folded: boolean) {
  flushSync(() => {
    for (const toggle of root.querySelectorAll<HTMLButtonElement>("[data-izk-section-toggle]")) {
      if (toggle.getAttribute("aria-expanded") === String(folded)) toggle.click();
    }
  });
}
