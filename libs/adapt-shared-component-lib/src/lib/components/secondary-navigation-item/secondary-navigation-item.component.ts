import { Component, Host, Input, OnInit } from '@angular/core';
import { SecondaryNavigationComponent } from '../secondary-navigation/secondary-navigation.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'lib-adapt-secondary-navigation-item',
  standalone: false,
  templateUrl: './secondary-navigation-item.component.html',
  styleUrl: './secondary-navigation-item.component.scss',
})
export class SecondaryNavigationItemComponent implements OnInit {
  @Input() name = 'Navigation Item';
  @Input() queryParams?: Record<string, string>;

  public preSelected = false;

  public isSelected = false;

  constructor(
    @Host() public navigation: SecondaryNavigationComponent,
    private route: ActivatedRoute
  ) {
    this.isSelected = this.selected;
  }

  ngOnInit(): void {
    // Check if query params exist on init and clear preSelected accordingly
    // This avoids mutating state during change detection in the getter
    const snapshotValues = Object.values(this.route.snapshot.queryParams);
    if (this.queryParams && snapshotValues.length > 0) {
      this.preSelected = false;
    }
  }

  public get selected() {
    const snapshotValues = Object.values(this.route.snapshot.queryParams);

    if (this.queryParams && snapshotValues.length > 0) {
      // Don't mutate state here - it's handled in ngOnInit
      const selected = snapshotValues.every((param) =>
        Object.values(this.queryParams as Record<string, string>).includes(param)
      );
      return selected;
    }

    return this.preSelected;
  }
}
