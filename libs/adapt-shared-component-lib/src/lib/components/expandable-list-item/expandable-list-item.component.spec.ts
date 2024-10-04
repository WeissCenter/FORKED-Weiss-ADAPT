import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExpandableListItemComponent } from './expandable-list-item.component';

describe('ExpandableListItemComponent', () => {
  let component: ExpandableListItemComponent;
  let fixture: ComponentFixture<ExpandableListItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExpandableListItemComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpandableListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
