import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Title, Meta } from '@angular/platform-browser';
import { RouterModule, Router } from '@angular/router';
import { ContentService } from '@adapt/adapt-shared-component-lib';
import { ComponentsModule } from '../../../components/components.module';
import { CognitoService } from '../../services/cognito/cognito.service';
import { UserService } from '../../services/user/user.service';
import { environment } from '../../../../environments/environment';

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
  pagesContent: any;

  constructor(
    private router: Router,
    private user: UserService,
    private titleService: Title,
    private metaService: Meta,
    private cognito: CognitoService,
    public contentService: ContentService
  ) {}

  goToSSO() {
    window.location.href = CognitoService.LOGIN_URL;
  }

  ngOnInit() {
    // Can update these variables with dynamical content pulled from the database if needed
    this.contentService.loadContent(environment.defaultContent).subscribe((res) => {
      if (res.pages) {
        this.pagesContent = res.pages;
        this.titleService.setTitle(res.pages.login.metaTitle);
        this.metaService.updateTag({ name: 'description', content: res.pages.login.metaDescription });
      }
    });
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
}
