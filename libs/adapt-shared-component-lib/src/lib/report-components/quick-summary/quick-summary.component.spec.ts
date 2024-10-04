import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuickSummaryComponent } from './quick-summary.component';

describe('QuickSummaryComponent', () => {
  let component: QuickSummaryComponent;
  let fixture: ComponentFixture<QuickSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [QuickSummaryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(QuickSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
