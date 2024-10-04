import { Component, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'lib-adapt-radio-select',
  templateUrl: './radio-select.component.html',
  styleUrls: ['./radio-select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: RadioSelectComponent,
    },
  ],
})
export class RadioSelectComponent implements ControlValueAccessor {
  @Input() inputId = crypto.randomUUID();
  @Input() legend = '';

  @Input() required = false;

  @Input() display: 'column' | 'row' = 'column';

  @Input() items: any[] = [];
  @Input() hint = '';

  @Input() itemAccessor = 'value';
  @Input() labelAccessor = 'label';
  @Input() descriptionAccessor = 'description';

  @Input() formControlName = '';

  onChange = (value: any) => {
    return null;
  };

  onTouched = () => {
    return null;
  };

  public disabled = false;

  public value: any;

  public radioSelect(event: Event) {
    const value = (event?.target as HTMLInputElement)?.value;

    this.writeValue(value);
    this.onChange(value);
  }

  writeValue(obj: any): void {
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
}
