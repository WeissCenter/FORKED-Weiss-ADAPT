import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthComponent } from './auth/auth.component';
import { TimedOutComponent } from './pages/timed-out/timed-out.component';
import { LoginComponent } from './pages/login/login.component';
import { LoggedOutComponent } from './pages/logged-out/logged-out.component';
import { ErrorComponent } from './pages/error/error.component';

const routes: Routes = [
  {
    path: 'error',
    title: 'ADAPT - Error',
    component: ErrorComponent,
  },
  {
    path: 'login',
    title: 'ADAPT - Login',
    component: LoginComponent,
  },
  {
    path: 'timedout',
    title: 'ADAPT - Session Expired',
    component: TimedOutComponent,
  },
  {
    path: 'loggedout',
    title: 'ADAPT - Log Out',
    component: LoggedOutComponent,
  },
  { path: ':action', component: AuthComponent, data: { hideSidenav: true } },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {}
