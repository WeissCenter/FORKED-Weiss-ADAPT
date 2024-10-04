import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HElementComponent } from './h-element.component';

describe('HElementComponent', () => {
  let component: HElementComponent;
  let fixture: ComponentFixture<HElementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HElementComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
