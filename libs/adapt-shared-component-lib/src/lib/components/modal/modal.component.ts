
import {
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnDestroy,
  Output,
  PLATFORM_ID,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'lib-adapt-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ModalComponent implements OnDestroy {
  //@ViewChild('wrapper') wrapper?: ElementRef<HTMLDivElement>;
  @ViewChild('dialog') dialog?: ElementRef<HTMLDialogElement>;
  @ViewChild('exit', { static: false }) exit?: ElementRef<HTMLDivElement>;

  @Output() closed = new EventEmitter();

  @Input() ariaLabelledby = '';
  @Input() ariaDescribedby = '';
  @Input() hideClose = false;
  @Input() large = false;
  @Input() heading? = '';
  @Input() closeText = '';
  @Input() classes = '';

  private closeRoute?: string;

  constructor(private router: Router, @Inject(PLATFORM_ID) private platform: string) {}

  public open(closeRoute?: string) {
    if (!this.dialog) return;
    this.closeRoute = closeRoute;
    this.dialog?.nativeElement.showModal();
  }

  public close() {
    if (!this.dialog) return;
    this.dialog?.nativeElement.close();
    this.closed.emit();

    if (this.closeRoute) {
      this.router.navigateByUrl(this.closeRoute);
    }
  }

  ngOnDestroy(): void {
    try{
      this.dialog?.nativeElement.close();
    // eslint-disable-next-line no-empty
    }catch(err){

    }
  
  }
}
