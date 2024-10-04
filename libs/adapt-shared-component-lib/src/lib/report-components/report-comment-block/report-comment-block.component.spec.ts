import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportCommentBlockComponent } from './report-comment-block.component';

describe('ReportCommentBlockComponent', () => {
  let component: ReportCommentBlockComponent;
  let fixture: ComponentFixture<ReportCommentBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReportCommentBlockComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportCommentBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
