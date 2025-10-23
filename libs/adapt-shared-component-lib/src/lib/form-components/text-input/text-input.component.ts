import { ChangeDetectorRef, Component, forwardRef, Input, Optional, Self } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, NgControl, Validators } from '@angular/forms';

@Component({
  selector: 'lib-adapt-text-input',
  templateUrl: './text-input.component.html',
  styleUrls: ['./text-input.component.scss'],
})
export class TextInputComponent implements ControlValueAccessor {
  @Input() id: string = crypto.randomUUID();
  @Input() autocomplete = '';
  @Input() label = '';
  @Input() hint?: string;
  @Input() readOnly = false;
  @Input() mask = '';
  @Input() patterns = {};
  @Input() type: 'short' | 'long' | 'password' | 'number' = 'short';
  public _value = '';

  public onChange = (value: string) => {
    return null;
  };
  public onTouched = () => {
    return null;
  };

  public disabled = false;

  constructor(private cd: ChangeDetectorRef, @Self() @Optional() public parent?: NgControl) {
    if (this.parent) {
      this.parent.valueAccessor = this;
    }
  }

  public get isRequired() {
    return Boolean(this.parent?.control?.hasValidator(Validators.required));
  }

  public onBlur(): void {
    if (this.onTouched) {
      this.onTouched();
    }
  }

  get value(): string {
    return this._value;
  }

  set value(val: string) {
    this._value = val;
    this.onChange(val);
    this.onTouched();
  }

  writeValue(value: string): void {
    this._value = value ?? '';
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
