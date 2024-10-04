import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SessionReloadBannerComponent } from './session-reload-banner.component';

describe('SessionReloadBannerComponent', () => {
  let component: SessionReloadBannerComponent;
  let fixture: ComponentFixture<SessionReloadBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SessionReloadBannerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SessionReloadBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
