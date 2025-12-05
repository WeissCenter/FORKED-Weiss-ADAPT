import { Component, effect, ViewChild, ElementRef } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { SettingsService, AlertService } from '@adapt/adapt-shared-component-lib';
import { Subscription, Subject, Observable, of } from 'rxjs';
import { AdaptDataService } from 'apps/adapt-admin/src/app/services/adapt-data.service';
import { ConfirmModalComponent } from '../../../../../../../../libs/adapt-shared-component-lib/src/lib/components/confirm-modal/confirm-modal.component';
// (Removed unused PageContentText and PageSectionContentText imports)
import { PagesContentService } from '@adapt-apps/adapt-admin/src/app/auth/services/content/pages-content.service';
import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'adapt-footer-links-settings',
  standalone: false,
  templateUrl: './footer-links-settings.component.html',
  styleUrls: ['./footer-links-settings.component.scss'],
})
export class FooterLinksSettingsComponent {
  @ViewChild(ConfirmModalComponent) confirmModal!: ConfirmModalComponent;
  @ViewChild('addBtn') addButton!: ElementRef<HTMLButtonElement>;
  public editLinks = false;

  public footerLinksForm: FormGroup;
  $pageContent = this.pagesContentService.getPageContentSignal('footer-links');

  public targetOptions = [
    { label: 'Open in same tab', value: 'sameTab' },
    { label: 'Open in new tab', value: 'newTab' },
  ];

  public subscriptions: Subscription[] = [];
  public confirmed = false;
  private confirmSubject?: Subject<boolean>; // handshake with guard
  constructor(
    private logger: NGXLogger,
    private fb: FormBuilder,
    private settingsService: SettingsService,
    private alert: AlertService,
    private data: AdaptDataService,
    public pagesContentService: PagesContentService,
    private el: ElementRef<HTMLElement>
  ) {
    this.footerLinksForm = this.fb.group({
      links: this.fb.array<FormGroup>([]),
    });

    effect(() => {
      const settings = this.settingsService.getSettingsSignal()();
      if (settings) {
        this.links.clear();

        for (const link of settings.footerLinks || []) {
          this.links.push(
            this.fb.group({
              label: this.fb.control(link.label),
              url: this.fb.control(link.url),
              external: this.fb.control(link.external),
              target: this.fb.control(link.target),
              icon: this.fb.control(link.icon),
              showAdmin: this.fb.control(link.showAdmin ?? true),
              showPublic: this.fb.control(link.showPublic ?? true),
            })
          );
        }

        // Settings re-synced; mark everything pristine so navigation warnings don't trigger.
        this.markFormPristine();
      }
    });
  }

  public onSave() {
    if (this.footerLinksForm.invalid) return;

    this.data.updateSettings({ footerLinks: this.links.getRawValue() }).subscribe({
      next: (result) => {
        this.alert.add({ type: 'success', title: 'Footer Links Saved', body: 'Footer link changes have been saved' });
        this.settingsService.next(result);

        // After pushing new settings, effect will repopulate controls; queue marking pristine after that flush.
        queueMicrotask(() => this.markFormPristine());
      },
      error: () => {
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
    this.alert.add({ type: 'info', title: 'Footer Link Removed', body: 'Be sure to click save to apply changes.' });
    this.markFormDirty();
    // After removal, move focus to the next logical item for keyboard continuity.
    queueMicrotask(() => {
      const count = this.links.length;
      if (count > 0) {
        let focusIndex = index;
        if (focusIndex >= count) focusIndex = count - 1; // If last item removed, focus previous
        this.liveMessage = `Focus set to link ${focusIndex + 1}.`;
        this.focusLink(focusIndex);
      } else {
        this.liveMessage = 'No links remaining.';
        this.addButton?.nativeElement.focus();
      }
    });
  }

  public addLink() {
    this.links.push(
      this.fb.group({
        label: this.fb.control(''),
        url: this.fb.control(''),
        external: this.fb.control(false),
        target: this.fb.control(''),
        icon: this.fb.control(''),
        showAdmin: this.fb.control(true),
        showPublic: this.fb.control(true),
      })
    );
    this.alert.add({ type: 'info', title: 'Footer Link Added', body: 'Be sure to click save to apply changes.' });
    this.markFormDirty();
    queueMicrotask(() => {
      this.liveMessage = `Focus set to new link ${this.links.length}.`;
      this.focusLink(this.links.length - 1);
    });
  }

  public get links() {
    return this.footerLinksForm.get('links') as FormArray;
  }

  // Live region message for screen reader announcements.
  public liveMessage = '';

  private focusLink(index: number) {
    const containers = Array.from(
      this.el.nativeElement.querySelectorAll<HTMLElement>('.footer-link-controls')
    );
    const target = containers[index];
    if (!target) return;
    // Prefer first interactive control inside the container.
    const firstFocusable = target.querySelector<HTMLElement>(
      'input, select, textarea, button, [tabindex]:not([tabindex="-1"])'
    );
    (firstFocusable || target).focus({ preventScroll: false });
  }

  public confirmModalClicked(confirmed: boolean) {
    this.logger.debug('confirmModalClicked, confirmed: ', confirmed);

    this.confirmed = confirmed;

    if (this.confirmSubject) {
      this.logger.debug('Have a confirmSubject');
      this.confirmSubject.next(confirmed);
      this.confirmSubject.complete();
      this.confirmSubject = undefined;
    }

    if (confirmed) {
      this.markFormPristine();

    }
    // User chose to stay; ensure confirmed stays false so future navigation re-prompts.
    else {

      // Keep form dirty state if there are unsaved changes; do not call markFormPristine here.
      // Optionally re-focus first link or Add button for continuity.
      if (this.links.length > 0) {
        this.focusLink(0);
      } else {
        this.addButton?.nativeElement.focus();
      }
    }

  }

  private markFormPristine() {
    // Mark all controls and the form as pristine to clear dirty state and suppress beforeunload warning.
    this.links.controls.forEach(group => {
      Object.values((group as FormGroup).controls).forEach(control => control.markAsPristine());
      group.markAsPristine();
    });
    this.footerLinksForm.markAsPristine();
  }

  private markFormDirty() {
    // Explicitly mark controls dirty after structural changes so navigation warning appears until saved.
    this.links.controls.forEach(group => {
      Object.values((group as FormGroup).controls).forEach(control => control.markAsDirty());
      group.markAsDirty();
    });
    this.footerLinksForm.markAsDirty();
  }

  // Called by guard to start/return existing confirmation observable
  public openConfirmOnce(): Observable<boolean> {
    // Emit true immediately if pristine or already confirmed
    if (!this.footerLinksForm.dirty || this.confirmed) return of(true);
    // Reuse in-flight subject if present
    if (this.confirmSubject) return this.confirmSubject.asObservable();
    // Create new subject and open modal once
    this.confirmSubject = new Subject<boolean>();
    this.confirmModal?.open();
    return this.confirmSubject.asObservable();
  }
}
