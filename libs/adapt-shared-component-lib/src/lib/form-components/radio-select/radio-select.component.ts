// radio-select.component.ts
import { Component, Input, Injector, OnInit, forwardRef } from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  NgControl,
  ValidationErrors,
  Validator,
  AbstractControl,
} from '@angular/forms';

@Component({
  selector: 'lib-adapt-radio-select',
  standalone: false,
  templateUrl: './radio-select.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RadioSelectComponent),
      multi: true,
    },
  ],
})
export class RadioSelectComponent implements ControlValueAccessor, Validator, OnInit {
  @Input() legend!: string;
  @Input() hint?: string;
  @Input() required = false;
  @Input() display: 'column' | 'row' = 'column';
  @Input() items: any[] = [];
  @Input() itemAccessor = 'value';
  @Input() labelAccessor = 'label';
  @Input() descriptionAccessor = 'description';
  @Input() name?: string;
  @Input() errorMessage?: string;

  // IDs for aria
  inputId = crypto.randomUUID();
  legendId = `${this.inputId}-legend`;
  hintId = `${this.inputId}-hint`;
  errorId = `${this.inputId}-error`;

  value: any;
  disabled = false;

  private ngControl?: NgControl;

  constructor(private injector: Injector) {}

  // ControlValueAccessor
  writeValue(val: any): void {
    this.value = val;
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

  private onChange: (v: any) => void = (_: any) => {
    /* noop */
  };
  private onTouched?: () => void;

  onSelected(val: any) {
    this.writeValue(val);
    this.onChange(val);
    if (this.onTouched) {
      this.onTouched();
    }
  }

  // Validator interface for template‐driven 'required'
  validate(control: AbstractControl): ValidationErrors | null {
    if (this.required && (control.value === null || control.value === undefined || control.value === '')) {
      return { required: true };
    }
    return null;
  }

  // computed props
  get errorState(): boolean {
    return !!(this.ngControl && this.ngControl.invalid && (this.ngControl.touched || this.ngControl.dirty));
  }

  get describedBy(): string | null {
    const ids = [];
    if (this.hint) {
      ids.push(this.hintId);
    }
    if (this.errorState) {
      ids.push(this.errorId);
    }
    return ids.length ? ids.join(' ') : null;
  }

  ngOnInit(): void {
    // grab the NgModel/FormControlName directive if present
    this.ngControl = this.injector.get(NgControl, undefined);
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }
}
