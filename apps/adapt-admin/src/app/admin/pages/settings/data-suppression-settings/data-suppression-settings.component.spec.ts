import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataSuppressionSettingsComponent } from './data-suppression-settings.component';

describe('DataSuppressionSettingsComponent', () => {
  let component: DataSuppressionSettingsComponent;
  let fixture: ComponentFixture<DataSuppressionSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataSuppressionSettingsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DataSuppressionSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
