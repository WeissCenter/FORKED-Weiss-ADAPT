import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { SettingsService } from '../../../services/settings.service';
import { Subscription } from 'rxjs';
import { AdaptDataService } from 'apps/adapt-admin/src/app/services/adapt-data.service';
import { NotificationsService } from 'apps/adapt-admin/src/app/services/notifications.service';
import { AlertService } from '@adapt/adapt-shared-component-lib';
import { RouterStateSnapshot } from '@angular/router';
import { ConfirmModalComponent } from '../../../../../../../../libs/adapt-shared-component-lib/src/lib/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'adapt-footer-links-settings',
  templateUrl: './footer-links-settings.component.html',
  styleUrls: ['./footer-links-settings.component.scss'],
})
export class FooterLinksSettingsComponent implements OnInit {
  @ViewChild(ConfirmModalComponent) confirmModal!: ConfirmModalComponent;
  public editLinks = false;

  public footerLinksForm: FormGroup;

  public targetOptions = [
    { label: 'Same Tab', value: 'sameTab' },
    { label: 'New Tab', value: 'newTab' },
  ];

  public subscriptions: Subscription[] = [];
  public confirmed = false;
  @HostListener('window:beforeunload')
  canDeactivate(isRouter = false, nextState?: RouterStateSnapshot): boolean {
    if (isRouter && !this.confirmed) {
      this.confirmModal?.open(nextState?.url);
    }

    return !this.footerLinksForm.dirty || this.confirmed;
  }
  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsService,
    private alert: AlertService,
    private data: AdaptDataService
  ) {
    this.footerLinksForm = this.fb.group({
      links: this.fb.array<FormGroup>([]),
    });
  }

  ngOnInit(): void {
    const settingsSub = this.settingsService.getSettingsObservable().subscribe((result) => {
      this.links.clear();

      for (const link of result.footerLinks || []) {
        this.links.push(
          this.fb.group({
            label: this.fb.control(link.label),
            url: this.fb.control(link.url),
            external: this.fb.control(link.external),
            target: this.fb.control(link.target),
            icon: this.fb.control(link.icon),
          })
        );
      }
    });

    this.subscriptions.push(settingsSub);
  }

  public onSave() {
    if (this.footerLinksForm.invalid) return;

    this.data.updateSettings({ footerLinks: this.links.getRawValue() }).subscribe({
      next: (result) => {
        this.alert.add({ type: 'success', title: 'Footer Links Saved', body: 'Footer link changes have been saved' });
        this.settingsService.next(result);
      },
      error: (err) => {
        this.alert.add({
          type: 'error',
          title: 'Footer Links Save Failed',
          body: 'Footer link changes have failed to save',
        });
      },
    });
  }

  public removeLink(index: number) {
    this.links.removeAt(index);
  }

  public addLink() {
    this.links.push(
      this.fb.group({
        label: this.fb.control(''),
        url: this.fb.control(''),
        external: this.fb.control(false),
        target: this.fb.control(''),
      })
    );
  }

  public get links() {
    return this.footerLinksForm.get('links') as FormArray;
  }
}
