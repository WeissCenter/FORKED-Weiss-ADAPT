import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  QueryList,
  Self,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl, Validators } from '@angular/forms';
import { comboBox } from '@uswds/uswds/js';

@Component({
  selector: 'lib-adapt-combo-box',
  templateUrl: './combo-box.component.html',
  styleUrls: ['./combo-box.component.scss'],
})
export class ComboBoxComponent implements AfterViewInit, OnDestroy, ControlValueAccessor {
  @ViewChild('comboBoxContainer') comboBoxContainer?: ElementRef<HTMLDivElement>;
  @ViewChild('parent') parent?: ElementRef<HTMLDivElement>;

  @ViewChildren('options') options?: QueryList<HTMLOptionElement>;

  @Input() readonly = false;

  @Input() comboID = '';
  @Input() label = '';
  @Input() hint = '';

  @Input() placeholder = '';

  @Input() items: any = [];

  @Input() itemAccessor?: string;
  @Input() itemLabel = 'name';

  @Input() compareID?: string;

  @Input() labelStyle?: Record<string, string>;

  @Input() comboBoxStyle?: Record<string, string>;

  onChange = (value: any) => {
    return null;
  };

  onTouched = () => {
    return null;
  };

  touched = false;

  disabled = false;

  public value: any;

  public compareFunc = this.compareByID.bind(this);

  constructor(@Self() @Optional() private parentControl?: NgControl) {
    if (this.parentControl) {
      this.parentControl.valueAccessor = this;
    }
  }

  compareByID(itemOne: any, itemTwo: any) {
    if (!this.compareID) {
      return itemOne && itemTwo && itemOne == itemTwo;
    }

    return itemOne && itemTwo && itemOne[this.compareID] == itemTwo[this.compareID];
  }

  ngAfterViewInit(): void {
    if (this.options) {
      this.options.changes.subscribe(() => this.writeValue(this.value));
    }

    if (this.comboBoxContainer) {
      comboBox.init(this.comboBoxContainer.nativeElement);

      if (this.disabled || this.readonly) {
        comboBox.disable(this.parent!.nativeElement);
      }

      this.parent?.nativeElement.addEventListener('focusout', (event) => {
        if (!event.isTrusted) return;

        this.markAsTouched();
      });
    }
  }

  ngOnDestroy(): void {
    if (this.comboBoxContainer) {
      comboBox.off(this.comboBoxContainer.nativeElement);
    }
  }

  markAsTouched() {
    if (!this.touched) {
      this.onTouched();
      this.touched = true;
    }
  }

  writeValue(obj: any): void {
    setTimeout(() => {
      if (this.parent) {
        const { comboBoxEl } = comboBox.getComboBoxContext(this.parent.nativeElement);

        const event = new CustomEvent('focusout', { bubbles: true, cancelable: true });

        comboBoxEl.dispatchEvent(event);
        this.updateDisabledState();
      }
    }, 100);

    this.value = obj;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  private updateDisabledState() {
    try {
      if (this.parent) {
        this.disabled ? comboBox.disable(this.parent.nativeElement) : comboBox.enable(this.parent.nativeElement);
      }
    } catch (err) {
      console.error('failed to set uswds combobox disable state');
    }
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;

    if (this.parent) {
      this.disabled ? comboBox.disable(this.parent.nativeElement) : comboBox.enable(this.parent.nativeElement);
    }
  }

  public get required() {
    return Boolean(this.parentControl?.control?.hasValidator(Validators.required));
  }
}
