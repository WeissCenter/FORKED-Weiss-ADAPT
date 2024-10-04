import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataSourcesSettingsComponent } from './data-sources-settings.component';

describe('DataSourcesSettingsComponent', () => {
  let component: DataSourcesSettingsComponent;
  let fixture: ComponentFixture<DataSourcesSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DataSourcesSettingsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DataSourcesSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
