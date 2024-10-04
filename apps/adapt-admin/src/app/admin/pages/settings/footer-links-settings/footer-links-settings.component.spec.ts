import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FooterLinksSettingsComponent } from './footer-links-settings.component';

describe('FooterLinksSettingsComponent', () => {
  let component: FooterLinksSettingsComponent;
  let fixture: ComponentFixture<FooterLinksSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FooterLinksSettingsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FooterLinksSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
