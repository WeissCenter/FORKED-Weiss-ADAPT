import {
  Injectable,
  ComponentFactoryResolver,
  ApplicationRef,
  ComponentRef,
  Injector,
  TemplateRef,
} from '@angular/core';
import { OptOutModalComponent } from '../components/opt-out-modal/opt-out-modal.component';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private modalRef!: ComponentRef<OptOutModalComponent>;

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private injector: Injector
  ) {}

  openOptOutModal(
    title: string,
    content: string | TemplateRef<any>,
    triggerId: string,
    optOutId: string,
    version: string,
    large = false
  ) {
    const modalFactory = this.componentFactoryResolver.resolveComponentFactory(OptOutModalComponent);
    this.modalRef = modalFactory.create(this.injector);
    this.modalRef.instance.large = large;
    this.modalRef.instance.title = title;
    if (typeof content === 'string') {
      this.modalRef.instance.textContent = content;
      this.modalRef.instance.contentTemplate = null;
    } else {
      this.modalRef.instance.textContent = null;
      this.modalRef.instance.contentTemplate = content;
    }
    this.modalRef.instance.triggerId = triggerId;

    this.modalRef.instance.doNotShowAgain.subscribe(() => {
      const doNotShowAgainArray = JSON.parse(localStorage.getItem('adapt_opt_out_ids') || '[]');
      // Combining the version number and the optOut ID allows us to show the modal again if the trigger in question has a new feature flag for a subsequent release.
      doNotShowAgainArray.push(optOutId + '_' + version);
      localStorage.setItem('adapt_opt_out_ids', JSON.stringify(doNotShowAgainArray));
    });

    this.modalRef.instance.closeEvent.subscribe(() => {
      this.closeModal();
    });

    this.appRef.attachView(this.modalRef.hostView);
    const domElem = (this.modalRef.hostView as any).rootNodes[0] as HTMLElement;
    document.body.appendChild(domElem);

    this.modalRef.instance.open();
  }

  closeModal() {
    if (this.modalRef) {
      // Focus the trigger element when the modal is closed.
      if (this.modalRef.instance.triggerId) document.getElementById(this.modalRef.instance.triggerId)?.focus();
      this.appRef.detachView(this.modalRef.hostView);
      this.modalRef.destroy();
    }
  }
}
