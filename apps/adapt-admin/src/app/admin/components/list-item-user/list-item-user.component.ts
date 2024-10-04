import { Component, Input } from '@angular/core';
import { CognitoGroups } from '../../../auth/services/role/role.service';

@Component({
  selector: 'adapt-list-item-user',
  templateUrl: './list-item-user.component.html',
  styleUrl: './list-item-user.component.scss',
})
export class ListItemUserComponent {
  @Input() headingLvl: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' = 'h2';
  @Input() user: any;

  public roles = Object.keys(CognitoGroups).map((grp) => ({ label: grp, value: grp }));
}
