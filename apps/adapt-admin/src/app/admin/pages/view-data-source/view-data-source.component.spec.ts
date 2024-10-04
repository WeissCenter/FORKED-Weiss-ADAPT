import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViewDataSourceComponent } from './view-data-source.component';

describe('ViewDataSourceComponent', () => {
  let component: ViewDataSourceComponent;
  let fixture: ComponentFixture<ViewDataSourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ViewDataSourceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewDataSourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
