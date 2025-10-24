import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AppRole, AppRolePermissions, appRolePermissions } from '@adapt/types';
import { AdaptDataService } from '../../../services/adapt-data.service';
import { AlertService, ContentService } from '@adapt/adapt-shared-component-lib';
import { ConfirmModalComponent } from 'libs/adapt-shared-component-lib/src/lib/components/confirm-modal/confirm-modal.component';
import { Subject, Subscription } from 'rxjs';
import { ToggleSwitchComponent } from 'libs/adapt-shared-component-lib/src/lib/form-components/toggle-switch/toggle-switch.component';

@Component({
  selector: 'adapt-list-item-user',
  templateUrl: './list-item-user.component.html',
  styleUrl: './list-item-user.component.scss',
})
export class ListItemUserComponent implements OnDestroy, OnInit {
  @Input() headingLvl: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' = 'h2';
  @Input() user: any;
  @Input() confirmEdit?: Subject<boolean>;
  @Input() confirmModal?: ConfirmModalComponent;
  @ViewChild(ToggleSwitchComponent) toggleSwitch!: ToggleSwitchComponent;
  @ViewChild('roleSelect') roleSelect!: ElementRef<HTMLSelectElement>;

  public lastEvent?: { action: 'role' | 'state'; value: any; old?: any };

  public roles = Object.keys(appRolePermissions).map((grp) => ({ label: grp, value: grp }));

  private confirmEditSub?: Subscription;

  private alertContent: any;
  

  constructor(private data: AdaptDataService, private alert: AlertService, private cd: ChangeDetectorRef) {
    // this.content.$content.subscribe(ctn => {
    // })
  }

  ngOnInit(): void {
    this.confirmEditSub = this.confirmEdit?.subscribe((confirmedChange: boolean) => this.handleLastEvent(confirmedChange));
  }

  private handleLastEvent(confirmedChange: boolean) {
    if (!this.lastEvent) return;

    if (confirmedChange) {
      switch (this.lastEvent.action) {
        case 'role': {
          this.changeRole(this.lastEvent.value);
          this.user.role = this.lastEvent.value;
          if (this.roleSelect) {
            this.roleSelect.nativeElement.value = this.lastEvent.value;
          }
          break;
        }
        case 'state': {
          this.changeUserState(this.lastEvent.value);
          this.user.active = this.lastEvent.value;
          this.cd.detectChanges();
          break;
        }
      }
    } else {
      switch (this.lastEvent.action) {
        case 'role': {
          this.user.role = this.lastEvent.old;
          if (this.roleSelect) {
            this.roleSelect.nativeElement.value = this.lastEvent.old;
          }
          break;
        }
        case 'state': {
          this.user.active = this.lastEvent.old;
          this.toggleSwitch.writeValue(this.lastEvent.old);
          this.cd.detectChanges();
          break;
        }
      }
    }

    this.lastEvent = undefined;
  }

  ngOnDestroy(): void {
    this.confirmEditSub?.unsubscribe();
  }

  public onChangeRole($event: any) {
    this.confirmModal?.open();
    this.lastEvent = { action: 'role', value: $event, old: this.user.role };
  }

  public onChangeState($event: any) {
    this.confirmModal?.open();
    this.lastEvent = { action: 'state', value: $event, old: this.user.active };
  }

  public changeRole(role: keyof AppRolePermissions) {
    this.data.editUser(this.user.username, role).subscribe({
      next: () => {
        this.alert.add({ type: 'success', title: 'User Edit Success', body: 'User role was changed successfully' });
      },
      error: () => {
        this.alert.add({ type: 'error', title: 'User edit failed', body: 'Failed to edit user role' });
      },
    });
  }

  public changeUserState(active = true) {
    this.data.editUser(this.user.username, this.user.role, active).subscribe({
      next: () => {
        this.alert.add({ type: 'success', title: 'User Edit Success', body: 'User state was changed successfully' });
      },
      error: () => {
        this.alert.add({ type: 'error', title: 'User edit failed', body: 'Failed to edit user state' });
      },
    });
  }
}
