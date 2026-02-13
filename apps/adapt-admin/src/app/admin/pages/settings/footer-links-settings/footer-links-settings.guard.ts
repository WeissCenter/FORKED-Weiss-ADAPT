import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs';
import { FooterLinksSettingsComponent } from './footer-links-settings.component';

@Injectable({ providedIn: 'root' })
export class FooterLinksSettingsGuard implements CanDeactivate<FooterLinksSettingsComponent> {
  canDeactivate(component: FooterLinksSettingsComponent): Observable<boolean> | boolean {
    // Allow if form pristine or already confirmed
    if (!component.footerLinksForm.dirty) return true;
    if (component.confirmed) return true;

    // Start / reuse confirmation observable
    return component.openConfirmOnce();
  }
}
