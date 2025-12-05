import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../services/user/user.service';
import { CognitoService } from '../services/cognito/cognito.service';

@Component({
  selector: 'adapt-auth',
  standalone: false,
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AuthComponent implements OnInit {
  action = '';
  text = '';
  buttonLabel = 'Sign in';

  constructor(private user: UserService, private router: Router, private activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    // redirect user if already logged in
    if (this.user.isLoggedIn) {
      this.router.navigateByUrl('/admin');
    }
    const routeParams = this.activatedRoute.snapshot.paramMap;
    this.action = routeParams.get('action') || '';
    switch (this.action) {
      case 'redirect': {
        // handle Cognito OAuth redirect
        const authCode = this.activatedRoute.snapshot.queryParamMap.get('code');
        if (authCode) {
          this.user.login(authCode);
        } else {
          this.router.navigateByUrl('auth/login');
        }
        break;
      }
      default:
        this.router.navigateByUrl('404');
    }
  }

  goToSSO() {
    window.location.href = CognitoService.LOGIN_URL;
  }
}
