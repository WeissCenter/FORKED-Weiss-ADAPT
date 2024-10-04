import { Component } from '@angular/core';
import { AdaptDataService } from 'apps/adapt-admin/src/app/services/adapt-data.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Component({
  selector: 'adapt-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrl: './user-settings.component.scss',
})
export class UserSettingsComponent {
  public _users = new BehaviorSubject([]);
  public $users = this._users.asObservable();

  constructor(private api: AdaptDataService) {
    this.api.getUsers().subscribe((users) => this._users.next(users));
  }
}
