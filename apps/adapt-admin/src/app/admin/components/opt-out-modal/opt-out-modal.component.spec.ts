import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OptOutModalComponent } from './opt-out-modal.component';

describe('OptOutModalComponent', () => {
  let component: OptOutModalComponent;
  let fixture: ComponentFixture<OptOutModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OptOutModalComponent],
    });
    fixture = TestBed.createComponent(OptOutModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
