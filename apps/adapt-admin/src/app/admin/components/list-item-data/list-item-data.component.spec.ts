import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListItemDataComponent } from './list-item-data.component';

describe('ListItemDataComponent', () => {
  let component: ListItemDataComponent;
  let fixture: ComponentFixture<ListItemDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListItemDataComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ListItemDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
