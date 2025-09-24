import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViewerFooterComponent } from './viewer-footer.component';

describe('ViewerFooterComponent', () => {
  let component: ViewerFooterComponent;
  let fixture: ComponentFixture<ViewerFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ViewerFooterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewerFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
