import { ContextMenuItem } from '@adapt/types';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'adapt-context-menu',
  templateUrl: './context-menu.component.html',
  styleUrls: ['./context-menu.component.scss'],
})
export class ContextMenuComponent {
  @Input() show = false;
  @Input() menuPositionX = 0;
  @Input() menuPositionY = 0;
  @Input() contextMenuItems: ContextMenuItem[] = [];

  @Output() menuItemClick = new EventEmitter();
}
