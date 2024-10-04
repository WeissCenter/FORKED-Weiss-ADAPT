import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListItemUserComponent } from './list-item-user.component';

describe('ListItemUserComponent', () => {
  let component: ListItemUserComponent;
  let fixture: ComponentFixture<ListItemUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListItemUserComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ListItemUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
