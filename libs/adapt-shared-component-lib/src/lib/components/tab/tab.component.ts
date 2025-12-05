import { ChangeDetectorRef, Component, Host, Input, TemplateRef, ViewChild } from '@angular/core';
import { TabViewComponent } from '../tab-view/tab-view.component';

@Component({
  selector: 'adapt-tab',
  standalone: false,
  templateUrl: './tab.component.html',
  styleUrls: ['./tab.component.scss'],
})
export class TabComponent {
  @ViewChild('content', { static: true }) content!: TemplateRef<void>;
  @Input() name = 'Tab';

  public show = true;
  constructor(@Host() tabView: TabViewComponent, private cd: ChangeDetectorRef) {}
}
