import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { AdaptDataService } from 'apps/adapt-admin/src/app/services/adapt-data.service';
import { Subscription } from 'rxjs';
import { SettingsService } from '../../../services/settings.service';
import { AlertService } from '@adapt/adapt-shared-component-lib';

@Component({
  selector: 'adapt-security-settings',
  templateUrl: './security-settings.component.html',
  styleUrl: './security-settings.component.scss',
})
export class SecuritySettingsComponent implements OnInit, OnDestroy {
  public editTimeout = false;

  public timeOutForm: FormGroup;

  private timeoutSub?: Subscription;

  constructor(
    private fb: FormBuilder,
    private data: AdaptDataService,
    private settings: SettingsService,
    private alert: AlertService
  ) {
    this.timeOutForm = this.fb.group({
      idleMinutes: this.fb.control(30),
      warningMinutes: this.fb.control(2),
      timeoutMinutes: this.fb.control(5),
    });

    this.timeOutForm.setValidators([this.timeOutValidator.bind(this)]);
  }

  ngOnInit(): void {
    this.timeoutSub = this.settings.getSettingsObservable().subscribe((settings) => {
      this.timeOutForm.setValue({
        idleMinutes: `${settings.idleMinutes}`,
        warningMinutes: `${settings.warningMinutes}`,
        timeoutMinutes: `${settings.timeoutMinutes}`,
      });
    });
  }

  ngOnDestroy(): void {
    this.timeoutSub?.unsubscribe();
  }

  public onSave() {
    if (this.timeOutForm.invalid) return;

    this.data.updateSettings({ idleMinutes: Number(this.idleMinutes.value), warningMinutes: Number(this.warningMinutes.value), timeoutMinutes: Number(this.timeoutMinutes.value) }).subscribe({
      next: () => {
        this.alert.add({ type: 'success', title: 'Settings Saved', body: 'Timeout settings were saved successfully.' });
      },
      error: () => {
        this.alert.add({
          type: 'error',
          title: 'Settings Save Failed',
          body: 'Timeout settings failed to save, please try again.',
        });
      },
    });
  }

  public get idleMinutes() {
    return this.timeOutForm?.get('idleMinutes') as FormControl;
  }

  public get warningMinutes() {
    return this.timeOutForm?.get('warningMinutes') as FormControl;
  }

  public get timeoutMinutes() {
    return this.timeOutForm?.get('timeoutMinutes') as FormControl;
  }

  private timeOutValidator(group: AbstractControl): ValidationErrors | null {
    if (!group) return null;

    const { warningMinutes, timeoutMinutes } = (group as FormGroup).controls;

    if (warningMinutes.value > timeoutMinutes.value)
      return { timeout: 'Warning minutes must be lower than timeout minutes' };

    return null;
  }
}
