import { Component, computed, effect, OnInit } from '@angular/core';

import { Title, Meta } from '@angular/platform-browser';
import { Router } from '@angular/router';

import { CognitoService } from '../../services/cognito/cognito.service';
import { UserService } from '../../services/user/user.service';
import { environment } from '@adapt-apps/adapt-admin/src/environments/environment';
import { PagesContentService } from '@adapt-apps/adapt-admin/src/app/auth/services/content/pages-content.service';
import {
  loginContentText,
  PageContentText,
} from '@adapt-apps/adapt-admin/src/app/admin/models/admin-content-text.model';

@Component({
  selector: 'adapt-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  // Form ngModel
  email: { label: string; value: string; status: { code: string; message: string } } = {
    label: '',
    value: '',
    status: { code: '', message: '' },
  };
  password: { label: string; value: string; status: { code: string; message: string } } = {
    label: '',
    value: '',
    status: { code: '', message: '' },
  };

  pageContent: PageContentText | null;
  loginContent: loginContentText | null;
  $pageContent = this.pagesContentService.getPageContentSignal('login');
  $loginContent = computed(() => this.$pageContent()?.loginContent || null);

  constructor(
    private router: Router,
    private user: UserService,
    private titleService: Title,
    private metaService: Meta,
    private cognito: CognitoService,
    public pagesContentService: PagesContentService
  ) {
    effect(() => {
      const loginContent = this.$loginContent();
      if (loginContent) {
        console.log('Setting login meta title/description: ', loginContent);
        this.titleService.setTitle(loginContent.metaTitle);
        this.metaService.updateTag({ name: 'description', content: loginContent.metaDescription });
      }
    });
  }

  goToSSO() {
    window.location.href = CognitoService.LOGIN_URL;
  }

  ngOnInit() {
    // this.pagesContentService.loadContent('en');
    // this.pagesContentService.loadContent('es-MX');
  }

  performLogin(e: any) {
    e.preventDefault();

    this.cognito.signIn({ username: this.email.value, password: this.password.value }).then((result) => {
      if (result) {
        this.router.navigateByUrl('/admin');
      } else {
        // todo set errors on form
      }
    });
  }

  public get showLogin() {
    return (this.pageContent as any)?.validLogin?.includes(environment.envLabel);
  }
}
