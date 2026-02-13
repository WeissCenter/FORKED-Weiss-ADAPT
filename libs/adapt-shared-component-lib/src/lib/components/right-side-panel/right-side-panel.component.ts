import { Component, ElementRef, HostListener, Input, OnDestroy, ViewChild } from '@angular/core';
import { FilterPanelService } from '../../services/filterpanel.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'adapt-right-side-panel',
  standalone: false,
  templateUrl: './right-side-panel.component.html',
  styleUrls: ['./right-side-panel.component.scss'],
})
export class RightSidePanelComponent implements OnDestroy{
  private subscription: Subscription;

  // @Input() show = false;
  public show = false;
  @ViewChild('filterPanel') panel!: ElementRef;

  @Input() title = 'Filter';
  @Input() description = 'Make your filtering selections and hit apply.';
  @Input() close = 'Close';
  @Input() location = 'right';

  constructor(private filterPanelService: FilterPanelService) {
    this.subscription = this.filterPanelService.currentFilterPanelState.subscribe((state) => {
      this.show = state;
    });
  }

  // Close panel when user hits escape key
  @HostListener('keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (this.show && event.key === 'Escape') {
      this.toggleFilterPanel();
    }
  }

  toggleFilterPanel() {
    this.show = false;
    this.filterPanelService.changeFilterPanelState(false);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
