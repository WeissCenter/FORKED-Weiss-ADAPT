import { Component } from '@angular/core';
import { NotificationsService } from '../services/notifications.service';

@Component({
  selector: 'adapt-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent {
  constructor(private notification: NotificationsService) {}

  show_accessibility_widget = false;
}
