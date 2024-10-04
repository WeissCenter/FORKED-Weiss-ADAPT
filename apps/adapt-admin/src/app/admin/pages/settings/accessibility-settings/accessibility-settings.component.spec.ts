import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccessibilitySettingsComponent } from './accessibility-settings.component';

describe('AccessibilitySettingsComponent', () => {
  let component: AccessibilitySettingsComponent;
  let fixture: ComponentFixture<AccessibilitySettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AccessibilitySettingsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AccessibilitySettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
