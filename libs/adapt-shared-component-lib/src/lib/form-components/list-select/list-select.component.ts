import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'lib-adapt-list-select',
  standalone: false,
  templateUrl: './list-select.component.html',
  styleUrls: ['./list-select.component.scss'],
})
export class ListSelectComponent {
  @Input() title = '';
  @Input() items: { id: string; label: string }[] = [];
  @Input() selectedItems: string[] = [];
  @Output() selectionChange = new EventEmitter<string[]>();

  isExpanded = false;
  hoveredItem: string | null = null;
  focusedItem: string | null = null;

  toggleExpand(): void {
    this.isExpanded = !this.isExpanded;
  }

  toggleSelection(itemId: string): void {
    if (itemId === 'all') {
      if (this.isAllSelected()) {
        // If all were selected, deselect all
        this.selectedItems = [];
      } else {
        // Select all items
        this.selectedItems = this.items.map((item) => item.id);
      }
    } else {
      const index = this.selectedItems.indexOf(itemId);
      if (index > -1) {
        this.selectedItems.splice(index, 1);
      } else {
        this.selectedItems.push(itemId);
      }
    }
    this.selectionChange.emit(this.selectedItems);
  }

  selectOnly(itemId: string): void {
    this.selectedItems = [itemId];
    this.selectionChange.emit(this.selectedItems);
  }

  setHoveredItem(itemId: string | null): void {
    this.hoveredItem = itemId;
  }

  setFocusedItem(itemId: string | null): void {
    this.focusedItem = itemId;
  }

  isOnlyButtonVisible(itemId: string): boolean {
    return this.hoveredItem === itemId || this.focusedItem === itemId;
  }

  get selectedCount(): number {
    return this.selectedItems.length;
  }

  isSelected(itemId: string): boolean {
    if (itemId === 'all') {
      return this.isAllSelected();
    }
    return this.selectedItems.includes(itemId);
  }

  isAllSelected(): boolean {
    return this.items.length > 0 && this.selectedItems.length === this.items.length;
  }
}
