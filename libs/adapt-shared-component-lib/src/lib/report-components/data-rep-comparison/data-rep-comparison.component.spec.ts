import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataRepComparisonComponent } from './data-rep-comparison.component';

describe('DataRepComparisonComponent', () => {
  let component: DataRepComparisonComponent;
  let fixture: ComponentFixture<DataRepComparisonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataRepComparisonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DataRepComparisonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
