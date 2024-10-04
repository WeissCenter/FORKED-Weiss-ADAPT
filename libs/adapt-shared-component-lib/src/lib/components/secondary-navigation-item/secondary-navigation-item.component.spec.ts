import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SecondaryNavigationItemComponent } from './secondary-navigation-item.component';

describe('SecondaryNavigationItemComponent', () => {
  let component: SecondaryNavigationItemComponent;
  let fixture: ComponentFixture<SecondaryNavigationItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SecondaryNavigationItemComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SecondaryNavigationItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
