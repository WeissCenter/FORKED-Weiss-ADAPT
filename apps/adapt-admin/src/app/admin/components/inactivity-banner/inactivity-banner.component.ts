import { AdaptSettings } from '@adapt/types';
import { Component, OnDestroy } from '@angular/core';
import { Idle } from '@ng-idle/core';
import { interval, map, Subscription } from 'rxjs';
import { SettingsService } from '../../services/settings.service';

@Component({
  selector: 'adapt-inactivity-banner',
  templateUrl: './inactivity-banner.component.html',
  styleUrl: './inactivity-banner.component.scss',
})
export class InactivityBannerComponent implements OnDestroy {
  public dismiss = false;

  public idleState = 'NOT_STARTED';

  public secondsSinceIdle = 0;

  public countdown = 0;

  private subscriptions: Subscription[] = [];

  constructor(
    public idle: Idle,
    public settings: SettingsService
  ) {
    idle.onTimeoutWarning.subscribe((seconds) => {
      this.countdown = seconds * 1000;
      this.secondsSinceIdle++;
    });

    const idleStart = idle.onIdleStart.subscribe(() => {
      this.idleState = 'IDLE';
      this.secondsSinceIdle = 0;
      this.countdown = 0;
    });

    const idleEnd = idle.onIdleEnd.subscribe(() => {
      this.idleState = 'NOT_IDLE';
      this.secondsSinceIdle = 0;
      this.countdown = 0;
    });

    this.subscriptions.push(idleStart, idleEnd);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  public get showWarning() {
    const { warningMinutes } = this.settings.getSettings();
    return this.countdown > 0 && this.countdown <= warningMinutes * 60 * 1000;
  }

  public get idleTime() {
    const { idleMinutes } = this.settings.getSettings();
    return (idleMinutes * 60 + this.secondsSinceIdle) * 1000;
  }

  public get extendTime() {
    const { idleMinutes } = this.settings.getSettings();
    return idleMinutes * 60 * 1000;
  }
}
