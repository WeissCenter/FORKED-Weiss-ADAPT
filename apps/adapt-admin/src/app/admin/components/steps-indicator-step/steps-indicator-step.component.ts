import {
  Component,
  Input,
  TemplateRef,
  ViewChild,
  AfterViewInit,
  ViewContainerRef,
  ElementRef,
  Renderer2,
} from '@angular/core';

@Component({
  selector: 'adapt-steps-indicator-step',
  templateUrl: './steps-indicator-step.component.html',
  styleUrls: ['./steps-indicator-step.component.scss'],
})
export class StepsIndicatorStepComponent implements AfterViewInit {
  @ViewChild('content', { static: true }) content!: TemplateRef<HTMLElement>;
  @Input() name = '';

  constructor(
    private viewContainerRef: ViewContainerRef,
    private renderer: Renderer2
  ) {}

  focusFirstInput() {
    // Use ViewContainerRef to create an embedded view
    const embeddedView = this.viewContainerRef.createEmbeddedView(this.content);
    // Wait for the view to be initialized and rendered
    setTimeout(() => {
      const rootNodes = embeddedView.rootNodes;

      for (const node of rootNodes) {
        if (node instanceof HTMLElement) {
          const input = node.querySelector('input, select, textarea') as HTMLElement;
          if (input) {
            input.focus();
            break;
          }
        }
      }
    });
  }

  ngAfterViewInit() {
    this.focusFirstInput();
  }
}
