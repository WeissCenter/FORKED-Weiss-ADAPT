import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FocusService {
  moveToFirstFocusableElement(selector = 'adapt-report'): void {
    const focusableElements = 'a, button, input, textarea, select, details,[tabindex]:not([tabindex="-1"])';
    const modal = document.querySelector(selector);
    if (modal) {
      const elements = Array.from(modal.querySelectorAll(focusableElements)).filter(
        (el) => !el.hasAttribute('disabled')
      );

      if (elements.length > 0) {
        (elements[0] as HTMLElement).focus();
      }
    }
  }

  moveToNextFocusableElement(selector = 'adapt-report'): void {
    const focusableElements = 'a, button, input, textarea, select, details,[tabindex]:not([tabindex="-1"])';
    const modal = document.querySelector(selector);
    if (modal) {
      const elements = Array.from(modal.querySelectorAll(focusableElements)).filter(
        (el) => !el.hasAttribute('disabled')
      );

      const activeElementIndex = elements.indexOf(document.activeElement as HTMLElement);
      if (activeElementIndex > -1 && activeElementIndex < elements.length - 1) {
        (elements[activeElementIndex + 1] as HTMLElement).focus();
      }
    }
  }

  moveToPreviousFocusableElement(selector = 'adapt-report'): void {
    const focusableElements = 'a, button, input, textarea, select, details,[tabindex]:not([tabindex="-1"])';
    const modal = document.querySelector(selector);
    if (modal) {
      const elements = Array.from(modal.querySelectorAll(focusableElements)).filter(
        (el) => !el.hasAttribute('disabled')
      );

      const activeElementIndex = elements.indexOf(document.activeElement as HTMLElement);
      if (activeElementIndex > 0) {
        // Ensure there's a previous element
        (elements[activeElementIndex - 1] as HTMLElement).focus();
      }
    }
  }

  moveToLastFocusableElement(selector = 'adapt-report'): void {
    const focusableElements = 'a, button, input, textarea, select, details,[tabindex]:not([tabindex="-1"])';
    const modal = document.querySelector(selector);
    if (modal) {
      const elements = Array.from(modal.querySelectorAll(focusableElements)).filter(
        (el) => !el.hasAttribute('disabled')
      );

      if (elements.length > 0) {
        (elements[elements.length - 1] as HTMLElement).focus();
      }
    }
  }
}
