import { AfterViewInit, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ComponentsModule } from './components/components.module';
import { TemplateService } from './services/template.service';
import { UserService } from './auth/services/user/user.service';
import { AemAccessibilityCenterService, AemAccessibilityCenterModule } from 'aem-accessibility-center';
import {GlossaryService} from '@adapt/adapt-shared-component-lib'

@Component({
  standalone: true,
  imports: [RouterModule, ComponentsModule, AemAccessibilityCenterModule],
  selector: 'adapt-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'adapt-admin';

  constructor(private template: TemplateService, private user: UserService, private gl: GlossaryService, private aemA11yService: AemAccessibilityCenterService) {}

  ngOnInit(): void {
    this.user.initUserSession();
  }

  ngAfterViewInit(): void {
    require('uswds');
  }
}
