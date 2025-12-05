import { Component, Input, Optional, Self } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';

@Component({
  selector: 'lib-adapt-toggle-switch',
  standalone: false,
  templateUrl: './toggle-switch.component.html',
  styleUrl: './toggle-switch.component.scss',
})
export class ToggleSwitchComponent implements ControlValueAccessor {
  @Input() id = crypto.randomUUID();
  @Input() toggledLabel = '';
  @Input() unToggledLabel = '';
  @Input() describedByID = '';

  public onChange = (value: boolean) => {};
  public onTouched = () => {};
  public value = false;
  public disabled = false;

  writeValue(obj: boolean): void {
    this.value = obj;
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

  public toggle() {
    this.value = !this.value;
    this.onChange(this.value);
  }

  constructor(@Self() @Optional() public parent?: NgControl) {
    if (this.parent) this.parent.valueAccessor = this;
  }
}
