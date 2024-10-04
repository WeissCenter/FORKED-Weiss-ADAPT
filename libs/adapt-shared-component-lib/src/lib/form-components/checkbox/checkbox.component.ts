import { Component, ElementRef, EventEmitter, Host, Input, OnInit, Optional, Output, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MultiSelectComponent } from '../multi-select/multi-select.component';

@Component({
  selector: 'lib-adapt-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: CheckboxComponent,
    },
  ],
})
export class CheckboxComponent implements OnInit, ControlValueAccessor {
  @ViewChild('input') inputElement!: ElementRef<HTMLInputElement>;

  @Output() blurred = new EventEmitter();
  @Output() focused = new EventEmitter();
  @Input() value: any;
  @Input() label = '';
  @Input() id: string = crypto.randomUUID();
  @Input() classes = '';

  public disabled = false;

  @Input() checked = false;
  @Output() checkedChange = new EventEmitter<boolean>();

  idSafeLabel = '';

  public onChange = (bool: boolean) => {
    return;
  };
  public onTouched = () => {
    return;
  };

  constructor(@Host() @Optional() private checkboxGroup: MultiSelectComponent) {

  }

  writeValue(obj: any): void {
    this.value = obj;
    this.checked = obj;
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

  ngOnInit() {
    this.idSafeLabel = this.label ? this.label.replace(/[^a-zA-Z0-9]/g, '_') : '';
  }

  toggleCheck() {
    if (this.checkboxGroup) {
      this.checkboxGroup?.addOrRemove(this.value);
      return;
    }
    this.checked = !this.checked;
    this.checkedChange.emit(this.checked);
    this.onChange(this.checked);
    this.onTouched();
  }

  onCheckboxChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.checked = input.checked;
    this.checkedChange.emit(this.checked);
  }

  isChecked() {
    if (this.checkboxGroup) return this.checkboxGroup?.contains(this.value);
    return this.checked;
  }

  focus() {
    this.inputElement?.nativeElement.focus();
  }
}
