import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListItemReportComponent } from './list-item-report.component';

describe('ListItemReportComponent', () => {
  let component: ListItemReportComponent;
  let fixture: ComponentFixture<ListItemReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListItemReportComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ListItemReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
