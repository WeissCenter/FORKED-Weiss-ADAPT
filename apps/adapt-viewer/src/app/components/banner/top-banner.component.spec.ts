import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BannerComponent, TopBannerComponent } from './top-banner.component';

describe('ViewerBannerComponent', () => {
  let component: TopBannerComponent;
  let fixture: ComponentFixture<TopBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TopBannerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TopBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
