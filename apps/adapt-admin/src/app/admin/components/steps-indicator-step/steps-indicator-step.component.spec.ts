import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StepsIndicatorStepComponent } from './steps-indicator-step.component';

describe('StepsIndicatorStepComponent', () => {
  let component: StepsIndicatorStepComponent;
  let fixture: ComponentFixture<StepsIndicatorStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StepsIndicatorStepComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StepsIndicatorStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
