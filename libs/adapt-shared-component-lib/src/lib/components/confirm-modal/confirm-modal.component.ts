import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'lib-adapt-confirm-modal',
  templateUrl: './confirm-modal.component.html',
  styleUrl: './confirm-modal.component.scss',
})
export class ConfirmModalComponent {
  @ViewChild(ModalComponent) confirmModal!: ModalComponent;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  @Input() heading? = 'You have unsaved changes.';
  @Input() body = 'Are you sure you want to cancel?';

  public open(route?: string) {
    this.confirmModal.open(route);
  }

  public close() {
    this.confirmModal.close();
  }

  public confirmCancel() {
    this.confirmModal.close();
    this.confirm.emit();
  }

  public modalCancel() {
    this.confirmModal.close();
    this.cancel.emit();
  }
}
