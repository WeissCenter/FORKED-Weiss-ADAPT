import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimedOutComponent } from './timed-out.component';

describe('TimedOutComponent', () => {
  let component: TimedOutComponent;
  let fixture: ComponentFixture<TimedOutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimedOutComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TimedOutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
