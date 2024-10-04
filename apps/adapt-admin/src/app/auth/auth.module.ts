import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing.module';
import { AuthComponent } from './auth/auth.component';
import { AuthBannerComponent } from './components/auth-banner/auth-banner.component';
import { SharedModule } from '../app.shared-module';
import { LoggedOutComponent } from './pages/logged-out/logged-out.component';
import { AdminModule } from '../admin/admin.module';
import { TimedOutComponent } from './pages/timed-out/timed-out.component';
import { LoginComponent } from './pages/login/login.component';
import { FormsModule } from '@angular/forms';
import { ComponentsModule } from '../components/components.module';
import { ErrorComponent } from './pages/error/error.component';

@NgModule({
  declarations: [
    AuthComponent,
    AuthBannerComponent,
    LoggedOutComponent,
    LoginComponent,
    TimedOutComponent,
    ErrorComponent,
  ],
  imports: [CommonModule, AuthRoutingModule, ComponentsModule, SharedModule, AdminModule, FormsModule],
  exports: [AuthBannerComponent],
})
export class AuthModule {}
