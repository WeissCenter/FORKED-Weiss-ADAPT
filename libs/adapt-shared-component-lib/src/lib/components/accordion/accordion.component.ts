import { Component, Input } from '@angular/core';

@Component({
  selector: 'lib-adapt-accordion',
  standalone: false,
  templateUrl: './accordion.component.html',
  styleUrls: ['./accordion.component.scss'],
})
export class AccordionComponent {
  accordionID = crypto.randomUUID();

  @Input() ngClass = {};
  @Input() ngStyle = {};

  @Input() header = '';

  @Input() bordered = false;

  public expanded = false;
}
