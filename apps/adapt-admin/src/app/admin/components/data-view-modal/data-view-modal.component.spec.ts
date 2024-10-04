import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataViewModalComponent } from './data-view-modal.component';

describe('DataViewModalComponent', () => {
  let component: DataViewModalComponent;
  let fixture: ComponentFixture<DataViewModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DataViewModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DataViewModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
