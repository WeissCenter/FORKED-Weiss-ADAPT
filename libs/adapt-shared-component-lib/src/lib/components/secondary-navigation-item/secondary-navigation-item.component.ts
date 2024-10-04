import { AfterContentInit, AfterViewInit, Component, EventEmitter, Host, Input, OnInit, Output } from '@angular/core';
import { SecondaryNavigationComponent } from '../secondary-navigation/secondary-navigation.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'lib-adapt-secondary-navigation-item',
  templateUrl: './secondary-navigation-item.component.html',
  styleUrl: './secondary-navigation-item.component.scss',
})
export class SecondaryNavigationItemComponent {
  @Input() name = 'Navigation Item';
  @Input() queryParams?: Record<string, string>;

  public preSelected = false;

  constructor(@Host() public navigation: SecondaryNavigationComponent, private route: ActivatedRoute){

  }


  public get selected(){
    const snapshotValues = Object.values(this.route.snapshot.queryParams);
    
    if(this.queryParams && snapshotValues.length > 0){
      this.preSelected = false;
      return snapshotValues.every(param => Object.values(this.queryParams as Record<string, string>).includes(param));
    }

    return false || this.preSelected;
  }


}
