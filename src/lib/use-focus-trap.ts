import * as React from 'react';

const TABBABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'iframe',
  'object',
  'embed',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function isVisible(element: HTMLElement): boolean {
  if (element.hidden) return false;
  if (element.getAttribute('aria-hidden') === 'true') return false;
  // offsetParent is null for display:none subtrees; allow elements whose
  // ancestor is position:fixed (offsetParent null) by also checking rects.
  if (element.offsetParent !== null) return true;
  const rects = element.getClientRects();
  return rects.length > 0;
}

function getTabbableElements(container: HTMLElement): HTMLElement[] {
  const nodes = Array.from(
    container.querySelectorAll<HTMLElement>(TABBABLE_SELECTOR),
  );
  return nodes.filter((node) => isVisible(node));
}

/**
 * Traps Tab / Shift+Tab focus within the elements contained by `ref` while
 * `active` is true. No external dependency. Wrapping is handled manually so a
 * forward Tab from the last element returns to the first and vice versa.
 */
export function useFocusTrap(
  ref: React.RefObject<HTMLElement>,
  active = true,
): void {
  React.useEffect(() => {
    if (!active) return;
    const container = ref.current;
    if (!container) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const tabbables = getTabbableElements(container);
      if (tabbables.length === 0) {
        // Nothing tabbable inside; keep focus on the container itself.
        event.preventDefault();
        container.focus();
        return;
      }
      const first = tabbables[0];
      const last = tabbables[tabbables.length - 1];
      const activeElement = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (activeElement === first || !container.contains(activeElement)) {
          event.preventDefault();
          last.focus();
        }
      } else {
        if (activeElement === last || !container.contains(activeElement)) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    container.addEventListener('keydown', onKeyDown);
    return () => container.removeEventListener('keydown', onKeyDown);
  }, [ref, active]);
}

export { getTabbableElements };
