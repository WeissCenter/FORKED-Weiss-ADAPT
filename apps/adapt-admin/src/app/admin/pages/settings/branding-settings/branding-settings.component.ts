import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { firstValueFrom, Subscription } from 'rxjs';
import { SettingsService } from '../../../services/settings.service';
import { AdaptDataService } from '../../../../services/adapt-data.service';
import { AdaptSettings } from '@adapt/types';
import { environment } from 'apps/adapt-admin/src/environments/environment';
import { AlertService } from '@adapt/adapt-shared-component-lib';

@Component({
  selector: 'adapt-branding-settings',
  templateUrl: './branding-settings.component.html',
  styleUrls: ['./branding-settings.component.scss'],
})
export class BrandingSettingsComponent implements OnDestroy, OnInit {
  public editLogo = false;
  public editCopyright = false;

  public brandingForm: FormGroup;

  public subscriptions: Subscription[] = [];

  public logoPreviewURL: SafeUrl = '';

  constructor(
    private fb: FormBuilder,
    private sanitzier: DomSanitizer,
    private alert: AlertService,
    private data: AdaptDataService,
    private settingsService: SettingsService
  ) {
    this.brandingForm = this.fb.group({
      logo: this.fb.control(undefined),
      copyright: this.fb.control(''),
    });

    const imagePreviewSub = this.logo.valueChanges.subscribe((image: File) => {
      this.logoPreviewURL = this.sanitzier.bypassSecurityTrustUrl(URL.createObjectURL(image));
    });

    this.subscriptions.push(imagePreviewSub);
  }

  ngOnInit(): void {
    const settingsSub = this.settingsService.getSettingsObservable().subscribe((result) => {
      this.copyright.setValue(result?.copyright || '');

      this.logoPreviewURL = this.sanitzier.bypassSecurityTrustUrl(
        `https://${environment.s3PublicAssetsDomainName}.s3.amazonaws.com/${result?.logo}`
      );
    });

    this.subscriptions.push(settingsSub);
  }

  public async onSave() {
    if (!this.brandingForm.valid) return;

    if (this.logo.dirty) {
      const url = await this.data.getSettingsLogoUploadURLPromise(this.logo.value.name);
      this.data.uploadFile(url, this.logo.value).subscribe({});
    }

    this.data.updateSettings({ logo: this.logo.value.name, copyright: this.copyright.value }).subscribe({
      next: (result) => {
        this.alert.add({ type: 'success', title: 'Branding settings saved', body: 'Branding changes have been saved' });
        this.settingsService.next(result);
      },
      error: (err) => {
        this.alert.add({
          type: 'error',
          title: 'Branding settings save failed',
          body: 'Branding changes have failed to save',
        });
      },
    });
  }

  public get logo() {
    return this.brandingForm.get('logo') as FormControl<File>;
  }

  public get copyright() {
    return this.brandingForm.get('copyright') as FormControl;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
