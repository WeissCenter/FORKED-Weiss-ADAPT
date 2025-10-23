import { RoleService } from '../services/role/role.service';
import { PermissionAction, PermissionObject } from '@adapt/types';
import {
  AfterContentInit,
  AfterViewInit,
  ChangeDetectorRef,
  Directive,
  Input,
  OnChanges,
  OnInit,
  Renderer2,
  SimpleChanges,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';

// *adaptAccessControl="'Data Views'; behavior: 'hide'; action: 'Write'"

@Directive({
  selector: '[adaptAccessControl]',
  standalone: true,
})
export class AccessControlDirective implements OnInit {
  @Input('adaptAccessControl') public adaptAccessControlObject?: PermissionObject;
  @Input() public adaptAccessControlAction: PermissionAction = 'Read';
  @Input() public adaptAccessControlBehavior: 'hide' | 'disable' | 'setVar' = 'hide';
  @Input() public adaptAccessControlExtraCondition = true;
  @Input() public adaptAccessControlComponent: any;
  @Input() public adaptAccessControlVarKey: any;
  @Input() public adaptAccessControlVarValue: any;
  constructor(
    private role: RoleService,
    private templateRef: TemplateRef<any>,
    private container: ViewContainerRef,
    private renderer: Renderer2,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (!this.adaptAccessControlObject) {
      console.error('missing permissions object');
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (!this.role.hasPermission(this.adaptAccessControlObject!, this.adaptAccessControlAction)) {
      this.handleTemplate();
    } else {
      this.container.createEmbeddedView(this.templateRef);
    }

    if (!this.adaptAccessControlExtraCondition) {
      this.container.clear();
    }
  }

  private handleTemplate() {
    switch (this.adaptAccessControlBehavior) {
      case 'disable': {
        const viewRef = this.container.createEmbeddedView(this.templateRef);
        const element = viewRef.rootNodes[0] as HTMLElement;

        this.renderer.setAttribute(element, 'disabled', 'true');
        this.renderer.setAttribute(element, 'title', 'You do not have permission to perform this action.');
        break;
      }
      case 'hide': {
        this.container.clear();
        break;
      }
      case 'setVar':{
        this.container.createEmbeddedView(this.templateRef);
        requestAnimationFrame(() => {
          if((this.adaptAccessControlVarKey && this.adaptAccessControlVarValue) && (this.adaptAccessControlVarKey in this.adaptAccessControlComponent)){
            this.adaptAccessControlComponent[this.adaptAccessControlVarKey] = this.adaptAccessControlVarValue;
            this.cd.detectChanges();
          }
        })
        break;
      }
    }
  }
}
