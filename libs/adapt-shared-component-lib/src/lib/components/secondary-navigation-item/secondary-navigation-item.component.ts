import { Component, Host, Input } from '@angular/core';
import { SecondaryNavigationComponent } from '../secondary-navigation/secondary-navigation.component';
import { ActivatedRoute } from '@angular/router';
//import { ChangeDetectorRef, AfterContentChecked} from '@angular/core';

@Component({
  selector: 'lib-adapt-secondary-navigation-item',
  templateUrl: './secondary-navigation-item.component.html',
  styleUrl: './secondary-navigation-item.component.scss',
})
export class SecondaryNavigationItemComponent {
  //implements AfterContentChecked
  @Input() name = 'Navigation Item';
  @Input() queryParams?: Record<string, string>;

  public preSelected = false;

  public isSelected = false;

  constructor(
    @Host() public navigation: SecondaryNavigationComponent,
    private route: ActivatedRoute
  ) //private cdRef: ChangeDetectorRef
  {
    this.isSelected = this.selected;
  }

  public get selected() {
    const snapshotValues = Object.values(this.route.snapshot.queryParams);



    if (this.queryParams && snapshotValues.length > 0) {
      this.preSelected = false;
      const selected = snapshotValues.every((param) => Object.values(this.queryParams as Record<string, string>).includes(param));

      return selected;
    }

    //this.cdRef.detectChanges();
    return false || this.preSelected;
  }

  // ngAfterContentChecked() {
  //
  //   this.cdRef.detectChanges();
  //
  // }
}
