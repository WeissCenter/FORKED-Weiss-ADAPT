import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportHeadingBlockComponent } from './report-heading-block.component';

describe('ReportHeadingBlockComponent', () => {
  let component: ReportHeadingBlockComponent;
  let fixture: ComponentFixture<ReportHeadingBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReportHeadingBlockComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportHeadingBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
