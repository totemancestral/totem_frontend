"use client";
import { useEffect, type Dispatch, type RefObject, type SetStateAction } from "react";

/** A disclosure spanning its header and panel; everything else becomes inert. */
export function useNavigationOverlay(open: boolean, header: RefObject<HTMLElement | null>, panel: RefObject<HTMLDivElement | null>, trigger: RefObject<HTMLButtonElement | null>, setOpen: Dispatch<SetStateAction<boolean>>) {
  useEffect(() => {
    if (!open || !header.current || !panel.current) return;
    const roots = [header.current, panel.current];
    const returnTarget = trigger.current;
    const previous = new Map<HTMLElement, boolean>();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function isolate(parent: HTMLElement) {
      for (const node of Array.from(parent.children)) {
        if (!(node instanceof HTMLElement) || roots.includes(node)) continue;
        if (roots.some(root => node.contains(root))) isolate(node);
        else {
          if (!previous.has(node)) previous.set(node, node.inert);
          node.inert = true;
        }
      }
    }
    isolate(document.body);
    const observer = new MutationObserver(() => isolate(document.body));
    observer.observe(document.body, { childList: true, subtree: true });
    function controls() {
      return roots.flatMap(root => Array.from(root.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),[tabindex="0"]')))
        .filter(el => el.getClientRects().length > 0 && !el.closest("[inert]"));
    }
    const initial = panel.current.querySelector<HTMLElement>("a[href],button:not([disabled])");
    initial?.focus();
    function keydown(event: KeyboardEvent) {
      if (event.key === "Escape") { event.preventDefault(); setOpen(false); return; }
      if (event.key !== "Tab") return;
      const items = controls();
      const first = items[0];
      const last = items.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
    function focusin(event: FocusEvent) {
      if (event.target instanceof Node && !roots.some(root => root.contains(event.target as Node))) initial?.focus();
    }
    const desktop = window.matchMedia("(min-width: 1024px)");
    const resize = () => { if (desktop.matches) setOpen(false); };
    desktop.addEventListener("change", resize);
    document.addEventListener("keydown", keydown);
    document.addEventListener("focusin", focusin);
    return () => {
      observer.disconnect();
      document.removeEventListener("keydown", keydown);
      document.removeEventListener("focusin", focusin);
      desktop.removeEventListener("change", resize);
      for (const [node, inert] of previous) node.inert = inert;
      document.body.style.overflow = overflow;
      if (returnTarget?.getClientRects().length) returnTarget.focus({ preventScroll: true });
    };
  }, [open, header, panel, trigger, setOpen]);
}
