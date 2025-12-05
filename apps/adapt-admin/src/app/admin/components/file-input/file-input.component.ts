import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  Self,
  ViewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl, Validators } from '@angular/forms';
import { fileInput } from '@uswds/uswds/js';

@Component({
  selector: 'adapt-file-input',
  standalone: false,
  templateUrl: './file-input.component.html',
  styleUrls: ['./file-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: FileInputComponent,
    },
  ],
})
export class FileInputComponent implements AfterViewInit, OnDestroy, ControlValueAccessor {
  @ViewChild('fileInputContainer') fileInputContainer?: ElementRef<HTMLDivElement>;
  @ViewChild('input') input?: ElementRef<HTMLDivElement>;

  @Input() fieldID = '';
  @Input() label = '';
  @Input() hint = '';
  @Input() accept = '';

  @Input() required = false;

  @Input() labelStyle?: { [clazz: string]: string };

  onChange = (value: any) => {
    return null;
  };

  onTouched = () => {
    return null;
  };

  touched = false;

  disabled = false;

  public value: any;

  ngAfterViewInit(): void {
    if (this.fileInputContainer) {
      fileInput.init(this.fileInputContainer.nativeElement);

      this.input?.nativeElement.addEventListener('focusout', () => this.markAsTouched());
    }
  }

  ngOnDestroy(): void {
    if (this.fileInputContainer) {
      fileInput.off(this.fileInputContainer.nativeElement);
    }
  }

  markAsTouched() {
    if (!this.touched) {
      this.onTouched();
      this.touched = true;
    }
  }

  writeValue(obj: any): void {
    this.value = obj;
  }

  registerOnChange(fn: any): void {
    this.onChange = (event: any) => {
      const context = fileInput.getFileInputContext(this.input!.nativeElement);

      return fn(context.inputEl.files?.[0]);
    };
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
