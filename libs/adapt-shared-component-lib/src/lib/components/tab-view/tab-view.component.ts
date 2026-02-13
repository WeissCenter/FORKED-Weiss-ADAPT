import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  QueryList,
  SimpleChanges,
  ViewChildren,
} from '@angular/core';
import { TabComponent } from '../tab/tab.component';

@Component({
  selector: 'adapt-tab-view',
  standalone: false,
  templateUrl: './tab-view.component.html',
  styleUrls: ['./tab-view.component.scss'],
})
export class TabViewComponent implements AfterContentInit, OnChanges {
  @ContentChildren(TabComponent) tabs!: QueryList<TabComponent>;
  @Input() tabIndex = 0;
  @Output() tabIndexChange = new EventEmitter<number>();

  public show = true;

  public selectedTab!: TabComponent;

  constructor(private cd: ChangeDetectorRef) {}

  public refresh() {
    requestAnimationFrame(() => this.setTabIndex());
  }

  ngAfterContentInit(): void {
    this.setTabIndex();
  }

  private setTabIndex() {
    if (!this.tabs) return;

    let idx = 0;
    if (this.tabIndex <= this.tabs?.length - 1 && this.tabIndex >= 0) idx = this.tabIndex;

    this.selectedTab = this.tabs.toArray()[idx];
  }

  public selectTab(index: number) {
    if (this.tabIndex === index) return;
    this.tabIndex = index;

    this.tabIndexChange.emit(index);

    this.selectedTab = this.tabs.toArray()[index];
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tabIndex']) this.setTabIndex();
  }
}
