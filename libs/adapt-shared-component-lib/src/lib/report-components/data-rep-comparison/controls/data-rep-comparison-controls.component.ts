import { Component, ElementRef, EventEmitter, Host, Input, Output, ViewChild } from '@angular/core';
import { DataRepComparisonControlsText } from '@adapt-apps/adapt-admin/src/app/admin/models/admin-content-text.model';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

/**
 * Component for displaying and managing comparison controls in a data report.
 *
 * Allows users to select two comparison items and submit them for side-by-side evaluation.
 * Handles form validation, emits comparison data on submit, and manages UI state for opening/closing controls.
 *
 * @example
 * <lib-data-rep-comparison-controls
 *   [comparisonOptions]="options"
 *   [content]="customContent"
 *   (comparisonSubmit)="onComparison($event)">
 * </lib-data-rep-comparison-controls>
 *
 * @property {FormGroup} form - The reactive form group for comparison controls.
 * @property {EventEmitter<{ label: string; value: string }[]>} comparisonSubmit - Emits selected comparison items on submit.
 * @property {ElementRef<HTMLButtonElement>} trigger - Reference to the trigger button element.
 * @property {DataRepComparisonControlsText} content - Text and labels for the component UI.
 * @property {any[]} comparisonOptions - List of options for comparison selection.
 * @property {string} comparisonOptionLabelAccessor - Property name for option label.
 * @property {string} comparisonOptionValueAccessor - Property name for option value.
 * @property {ElementRef<HTMLButtonElement>} cancelButton - Reference to the cancel button element.
 * @property {boolean} isOpen - Whether the controls are currently open.
 * @property {string} id - Unique identifier for the component instance.
 *
 * @method toggleControls - Toggles the open/closed state of the controls and manages focus.
 * @method comparison1 - Getter for the first comparison form control.
 * @method comparison2 - Getter for the second comparison form control.
 * @method onSubmit - Handles form submission, emits comparison data if valid, and marks invalid controls as touched.
 */
@Component({
  selector: 'lib-data-rep-comparison-controls',
  templateUrl: './data-rep-comparison-controls.component.html',
  styleUrls: ['./data-rep-comparison-controls.component.scss'],
})
export class DataRepComparisonControlsComponent {
  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      comparison1: new FormControl('', [Validators.required]),
      comparison2: new FormControl('', [Validators.required]),
    });
  }

  public form: FormGroup;

  @Output() comparisonSubmit = new EventEmitter<{ label: string; value: string }[]>();

  @Input() public trigger!: ElementRef<HTMLButtonElement>;
  @Input() content: DataRepComparisonControlsText = {
    title: 'Comparison mode',
    description: `Evaluate school districts side-by-side and compare how data points differ between the two.`,
    compareButtonLabel: 'Generate Comparison',
    cancelButtonLabel: 'Cancel',
    triggerButtonLabel: 'Compare',
    comparison1Label: 'Comparison item 1',
    comparison2Label: 'Comparison item 2',
    validationMessages: {
      required: 'All fields are required.',
    },
  };
  @Input() public comparisonOptions: any[] = [];
  @Input() comparisonOptionLabelAccessor = 'label';
  @Input() comparisonOptionValueAccessor = 'value';
  @ViewChild('formElement') formElement!: ElementRef<HTMLFormElement>;

  public isOpen = true;
  public id = 'data-rep-comparison-controls-' + crypto.randomUUID();

  public toggleControls() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      setTimeout(() => {
        const firstFocusable = this.formElement?.nativeElement.querySelector('input');
        if (firstFocusable) {
          (firstFocusable as HTMLElement).focus();
        }
      }, 0);
    } else if (this.trigger) {
      setTimeout(() => {
        this.trigger.nativeElement.focus();
      }, 0);
    }
  }

  get comparison1() {
    return this.form.get('comparison1') as FormControl;
  }

  get comparison2() {
    return this.form.get('comparison2') as FormControl;
  }

  public onSubmit() {
    if (this.form.valid) {
      console.log('Comparing:', this.comparison1.value, 'and', this.comparison2.value);
      // Find the selected options based on the provided accessors
      const selectedComparison1 = this.comparisonOptions.find(
        (option) => option[this.comparisonOptionValueAccessor] === this.comparison1.value
      );
      const selectedComparison2 = this.comparisonOptions.find(
        (option) => option[this.comparisonOptionValueAccessor] === this.comparison2.value
      );
      if (!selectedComparison1 || !selectedComparison2) {
        console.error('Selected comparison not found in options');
        return;
      }

      this.comparisonSubmit.emit([
        selectedComparison1,
        selectedComparison2,
      ]);
    } else {
      // Handle validation errors
      Object.keys(this.form.controls).forEach((key) => {
        const control = this.form.get(key);
        if (control && control.invalid) {
          control.markAsTouched();
        }
      });
    }
  }
}
