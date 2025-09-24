import {
  AfterViewInit,
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  QueryList,
} from '@angular/core';
import { SecondaryNavigationItemComponent } from '../secondary-navigation-item/secondary-navigation-item.component';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'lib-adapt-secondary-navigation',
  templateUrl: './secondary-navigation.component.html',
  styleUrl: './secondary-navigation.component.scss',
})
export class SecondaryNavigationComponent implements AfterViewInit, OnDestroy {
  @ContentChildren(SecondaryNavigationItemComponent) tabs!: QueryList<SecondaryNavigationItemComponent>;
  @Input() ariaLabel = 'ADAPT Secondary Navigation';
  @Input() id = crypto.randomUUID();
  @Input() preselectFirst = true;
  private subscriptions: Subscription[] = [];

  public anySelected() {
    for (const tab of this.tabs) {
      if (tab.selected) {
        return true;
      }
    }

    return false;
  }

  ngAfterViewInit(): void {
    if (this.preselectFirst && !this.anySelected()) {
      this.tabs.first.preSelected = true;
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
