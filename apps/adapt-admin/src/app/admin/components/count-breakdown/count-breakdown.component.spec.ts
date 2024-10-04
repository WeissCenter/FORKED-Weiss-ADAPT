import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CountBreakdownComponent } from './count-breakdown.component';

describe('CountBreakdownComponent', () => {
  let component: CountBreakdownComponent;
  let fixture: ComponentFixture<CountBreakdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CountBreakdownComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CountBreakdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
