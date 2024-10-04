import { Injectable } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { AdaptDataService } from './adapt-data.service';
import { environment } from '../../environments/environment';
import { AlertService } from '../../../../../libs/adapt-shared-component-lib/src/lib/services/alert.service';
import { Observable, ReplaySubject, firstValueFrom } from 'rxjs';
import { UserService } from '../auth/services/user/user.service';

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  private _notifications = new ReplaySubject<Notification[]>();
  public $notifications = this._notifications.asObservable();

  constructor(
    private push: SwPush,
    private data: AdaptDataService,
    private alert: AlertService,
    private user: UserService
  ) {
    this.setup();
    this.push
      .requestSubscription({
        serverPublicKey: environment.VAPID_KEY,
      })
      .then((result) => {
        return firstValueFrom(this.user.username$).then((username) =>
          firstValueFrom(this.data.registerPushNotifications(username, result))
        );
      });

    this.push.messages.subscribe((message: any) => {
      this.alert.add({
        type: message?.success ? 'success' : 'error',
        title: 'System Notification',
        body: message.message,
      });
      this.addNotification(message);
    });
  }

  private setup() {
    const savedNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    this._notifications.next(savedNotifications);
  }

  public addNotification(notification: PushNotification) {
    const savedNotifications = JSON.parse(localStorage.getItem('notifications') || '[]') as Notification[];

    savedNotifications.push({ id: crypto.randomUUID(), date: Date.now(), notification });

    savedNotifications.sort((a, b) => a.date - b.date);

    this._notifications.next(savedNotifications);

    localStorage.setItem('notifications', JSON.stringify(savedNotifications));
  }

  public removeNotification(id: string) {
    const savedNotifications = this.getNotificationsFromStorage();

    const filtered = savedNotifications.filter((item) => item.id !== id);

    filtered.sort((a, b) => a.date - b.date);

    this._notifications.next(filtered);

    localStorage.setItem('notifications', JSON.stringify(filtered));
  }

  private getNotificationsFromStorage() {
    return JSON.parse(localStorage.getItem('notifications') || '[]') as Notification[];
  }
}

export interface Notification {
  id: string;
  date: number;
  notification: PushNotification;
}

export interface PushNotification {
  success: boolean;
  message: string;
  data?: any;
}
