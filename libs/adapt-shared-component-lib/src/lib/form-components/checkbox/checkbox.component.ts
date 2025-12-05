import {
  Component,
  ElementRef,
  EventEmitter,
  Host,
  Input,
  OnInit,
  Optional,
  Output,
  ViewChild,
  Injector,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl } from '@angular/forms';
import { MultiSelectComponent } from '../multi-select/multi-select.component';
import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'lib-adapt-checkbox',
  standalone: false,
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: CheckboxComponent,
      multi: true,
    },
  ],
})
export class CheckboxComponent implements OnInit, ControlValueAccessor {
  @ViewChild('input') inputElement!: ElementRef<HTMLInputElement>;

  //  If this checkbox lives inside one of our custome multi select components, we’ll toggle group state.
  private checkboxGroup?: MultiSelectComponent;
  private ngControl?: NgControl;

  @Input() value: any;
  @Input() label = '';
  @Input() id: string = crypto.randomUUID();
  @Input() classes = '';
  @Input() name?: string;

  @Input() checked = false;
  @Output() checkedChange = new EventEmitter<boolean>();

  @Output() blurred = new EventEmitter<FocusEvent>();
  @Output() focused = new EventEmitter<FocusEvent>();

  public disabled = false;
  public idSafeLabel = '';

  // ControlValueAccessor callbacks
  private onChange: (v: any) => void = (_: any) => {
    /* noop */
  };
  private onTouched?: () => void;

  constructor(private logger: NGXLogger,
              private injector: Injector,
              @Host() @Optional() checkboxGroup: MultiSelectComponent) {
    // grab the group if present (no circular DI here)
    this.checkboxGroup = checkboxGroup ?? undefined;
  }

  ngOnInit() {
    this.logger.debug('Inside CheckboxComponent ngOnInit');
    // sanitize label for ID usage
    this.idSafeLabel = this.label ? this.label.replace(/[^a-zA-Z0-9]/g, '_') : '';

    try {
      this.ngControl = this.injector.get(NgControl, undefined);
      if (this.ngControl) {
        this.logger.debug('Found ngControl');
        this.ngControl.valueAccessor = this;
      }
    }
    catch (err) {
      this.logger.error('Error getting NgControl from injector, error: ', err);
    }

  }

  writeValue(obj: any): void {
    this.checked = !!obj;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInputChange(event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;

    if (this.checkboxGroup) {
      // toggle in the parent multiselect
      this.checkboxGroup.addOrRemove(this.value);
    } else {
      // standalone checkbox:
      this.checked = isChecked;
      this.onChange(isChecked);
      this.checkedChange.emit(isChecked);
    }
  }

  onInputBlur(event: FocusEvent) {
    if (this.onTouched) {
      this.onTouched();
    }
    this.blurred.emit(event);
  }

  focus() {
    this.inputElement.nativeElement.focus();
  }

  // final truth check (group overrides standalone)
  isChecked(): boolean {
    return this.checkboxGroup ? !!this.checkboxGroup.contains(this.value) : this.checked;
  }
}
