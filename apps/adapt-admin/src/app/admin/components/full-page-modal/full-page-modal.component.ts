import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';

@Component({
  selector: 'adapt-full-page-modal',
  templateUrl: './full-page-modal.component.html',
  styleUrls: ['./full-page-modal.component.scss'],
})
export class FullPageModalComponent implements OnDestroy {
  @ViewChild('modal') modal!: ElementRef<HTMLDialogElement>;

  public opened = false;

  public open() {
    if (!this.modal) return;
    this.opened = true;
    this.modal.nativeElement.showModal();
    history.pushState(null, '', window.location.href);
  }

  public close() {
    if (!this.modal) return;
    this.opened = false;
    this.modal.nativeElement.close();
  }

  ngOnDestroy(): void {
    this.close();
  }
}
