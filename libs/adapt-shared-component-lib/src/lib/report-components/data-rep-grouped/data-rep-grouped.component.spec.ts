import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataRepGroupedComponent } from './data-rep-grouped.component';

describe('DataRepGroupedComponent', () => {
  let component: DataRepGroupedComponent;
  let fixture: ComponentFixture<DataRepGroupedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DataRepGroupedComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DataRepGroupedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
