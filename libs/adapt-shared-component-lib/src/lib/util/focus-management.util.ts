/**
 * Focus management utilities for accessibility compliance.
 * These utilities help ensure proper focus management for in-page navigation
 * and other interactive elements, supporting WCAG 2.4.3 (Focus Order) and
 * WCAG 2.4.7 (Focus Visible).
 */

/**
 * Moves focus to an element, adding temporary tabindex if needed for
 * non-interactive elements like headings.
 *
 * @param element The element to focus
 * @param options Optional configuration
 * @param options.preventScroll If true, prevents scrolling when focusing (default: true)
 * @param options.removeTabindexOnBlur If true, removes tabindex when element loses focus (default: true)
 */
export function focusElement(
  element: HTMLElement | null,
  options: { preventScroll?: boolean; removeTabindexOnBlur?: boolean } = {}
): void {
  if (!element) return;

  const { preventScroll = true, removeTabindexOnBlur = true } = options;

  const interactiveElements = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'];
  const needsTabindex =
    element.tabIndex < 0 && !interactiveElements.includes(element.tagName);

  if (needsTabindex) {
    element.setAttribute('tabindex', '-1');

    if (removeTabindexOnBlur) {
      element.addEventListener(
        'blur',
        () => {
          element.removeAttribute('tabindex');
        },
        { once: true }
      );
    }
  }

  element.focus({ preventScroll });
}

/**
 * Scrolls to an element and moves focus to it.
 * Useful for in-page navigation where both scrolling and focus management are needed.
 *
 * @param elementId The ID of the element to scroll to and focus
 * @param scrollBehavior The scroll behavior - 'instant' or 'smooth' (default: 'instant')
 */
export function scrollAndFocus(
  elementId: string,
  scrollBehavior: ScrollBehavior = 'instant'
): void {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({ behavior: scrollBehavior });
    focusElement(element, { preventScroll: true });
  }
}

/**
 * Scrolls to an element by reference and moves focus to it.
 *
 * @param element The element to scroll to and focus
 * @param scrollBehavior The scroll behavior - 'instant' or 'smooth' (default: 'instant')
 */
export function scrollToElementAndFocus(
  element: HTMLElement | null,
  scrollBehavior: ScrollBehavior = 'instant'
): void {
  if (!element) return;

  element.scrollIntoView({ behavior: scrollBehavior });
  focusElement(element, { preventScroll: true });
}
