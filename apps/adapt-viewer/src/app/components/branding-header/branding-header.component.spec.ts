import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrandingHeaderComponent } from './branding-header.component';

describe('ViewerHeroBannerComponent', () => {
  let component: BrandingHeaderComponent;
  let fixture: ComponentFixture<BrandingHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BrandingHeaderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BrandingHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
