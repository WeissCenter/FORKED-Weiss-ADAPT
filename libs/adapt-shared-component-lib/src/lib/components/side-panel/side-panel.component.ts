import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'lib-adapt-side-panel',
  templateUrl: './side-panel.component.html',
  styleUrl: './side-panel.component.scss',
})
export class SidePanelComponent {
  public show = false;
  @ViewChild('sidePanel') panel!: ElementRef;

  @Input() title = 'Adapt Side Panel';
  @Input() description = 'Enter some descriptive content here.';
  @Input() selectorClose = 'Close';

  @Input() direction: 'right' | 'left' = 'right';

  @Output() statusChange = new EventEmitter<boolean>();

  close() {
    this.show = false;
    this.statusChange.emit(false);
  }

  open() {
    this.show = true;
    this.statusChange.emit(true);
  }

  // Close panel when user hits escape key
  @HostListener('keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (this.show && event.key === 'Escape') {
      this.close();
    }
  }
}
