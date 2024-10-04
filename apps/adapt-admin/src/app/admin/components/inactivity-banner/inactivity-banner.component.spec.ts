import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InactivityBannerComponent } from './inactivity-banner.component';

describe('InactivityBannerComponent', () => {
  let component: InactivityBannerComponent;
  let fixture: ComponentFixture<InactivityBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InactivityBannerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InactivityBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
