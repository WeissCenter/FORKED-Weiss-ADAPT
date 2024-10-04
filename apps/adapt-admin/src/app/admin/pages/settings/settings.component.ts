import { AfterViewInit, Component, ElementRef, QueryList, ViewChildren } from '@angular/core';

@Component({
  selector: 'adapt-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements AfterViewInit {
  public listItems!: HTMLElement[];

  public settingPages = [
    {
      title: 'Data Sources',
      path: 'data-sources',
      description: 'Pending meeting with State Data Managers.',
    },
    {
      title: 'Data Suppression',
      path: 'data-suppression',
      description:
        'Protect sensitive data with configurable suppression rules, maintaining user privacy and adhering to compliance standards.',
    },
    {
      title: 'Footer Links',
      path: 'footer-links',
      description:
        'Edit and manage essential footer content such as privacy policies and terms of service, providing transparency and user guidance.',
    },
    {
      title: 'Security',
      path: 'security',
      description:
        'Secure the platform with robust security settings, including session time-outs and alert systems, to protect user data and system integrity.',
    },
    {
      title: 'User Management',
      path: 'user-management',
      description:
        'Administer user profiles, permissions, and roles within the platform, ensuring secure access control and efficient user oversight.',
    },
  ];

  constructor(private elementRef: ElementRef) {}

  ngAfterViewInit(): void {
    this.listItems = [...this.elementRef.nativeElement.getElementsByClassName('settings-list-item')];
  }
}
