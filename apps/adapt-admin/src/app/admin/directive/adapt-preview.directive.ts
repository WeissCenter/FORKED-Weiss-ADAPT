import { Directive, HostListener, Input, ElementRef, Renderer2, TemplateRef, OnInit } from '@angular/core';
import { ModalService } from '../services/modal.service';

/**
 * Directive for displaying an adapt preview modal.
 * This directive allows the user to trigger a modal that displays information about an upcoming feature.
 * The modal can be triggered by clicking on the element or by focusing on it and pressing Enter or Space.
 * If the user has opted out of seeing the modal, the element will be disabled.
 */

@Directive({
  selector: '[adaptPreview]',
  standalone: false,
})
export class AdaptPreviewDirective implements OnInit {
  @Input() modalTitle = 'Upcoming feature';
  @Input() modalContent: string | TemplateRef<any> =
    'This feature is currently under development and will be available in a future release.';
  @Input() adaptPreviewVersion = '1.0.0';
  @Input() adaptPreviewLargeModal = true;
  // Optional input that allows us to have multiple triggers on the same page that are all tied to the same feature flag (IE, all "share" buttons within report expandable list items).
  @Input() adaptPreviewCategory!: string;

  constructor(private modalService: ModalService, private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {
    this.applyStyles();
  }

  @HostListener('focus') onFocus() {
    // Ensures that the button updates its styles when the user closes the modal after opting out (closeModal() sets the focus back to the trigger element)
    this.applyStyles();
  }

  @HostListener('click') onClick() {
    this.triggerModal();
  }

  @HostListener('keydown', ['$event']) onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.triggerModal();
    }
  }

  private optedOut() {
    const doNotShowAgain = JSON.parse(localStorage.getItem('adapt_opt_out_ids') || '[]');

    // Combining the version number and the adaptPreviewCategory/trigger element ID allows us to show the modal again if the trigger in question has a new feature flag for a subsequent release.
    const triggerId = this.adaptPreviewCategory ?? this.el.nativeElement.id;
    const optOutId = `${triggerId}_${this.adaptPreviewVersion}`;

    if (doNotShowAgain.includes(optOutId)) {
      return true;
    } else {
      return false;
    }
  }

  private triggerModal() {
    if (this.optedOut()) {
      return;
    }
    const triggerId = this.el.nativeElement.id;
    if (!triggerId) {
      console.log('ADAPT preview directive requires an ID:');
      console.log(this.el.nativeElement);
    }
    this.modalService.openOptOutModal(
      this.modalTitle,
      this.modalContent,
      triggerId,
      this.adaptPreviewCategory ?? triggerId,
      this.adaptPreviewVersion,
      this.adaptPreviewLargeModal
    );
  }

  private applyStyles() {
    if (!this.optedOut()) {
      this.renderer.addClass(this.el.nativeElement, 'adapt-preview-button');
      this.renderer.setAttribute(this.el.nativeElement, 'tabindex', '0');
    } else {
      if (this.el.nativeElement.parentElement) {
        this.renderer.setAttribute(this.el.nativeElement.parentElement, 'aria-disabled', 'true');
      }

      this.renderer.setAttribute(this.el.nativeElement, 'disabled', 'true');
      this.renderer.setAttribute(this.el.nativeElement, 'aria-disabled', 'true');
      this.renderer.removeAttribute(this.el.nativeElement, 'tabindex');
      // If this element is part of a category of elements that all share the same feature flag, we want to hide the other elements in the category as well. Needed for when this function runs to check for style updates after a modal closes
      if (this.adaptPreviewCategory) {
        const elements = document.querySelectorAll(`[adaptPreviewCategory="${this.adaptPreviewCategory}"]`);
        elements.forEach((element) => {
          this.renderer.setAttribute(element, 'disabled', 'true');
          this.renderer.setAttribute(element, 'aria-disabled', 'true');
          this.renderer.removeAttribute(element, 'tabindex');
        });
      }
    }
  }
}
