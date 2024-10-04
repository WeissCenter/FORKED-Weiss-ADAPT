import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormControl, FormControlName, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EditableDirective } from '../../directive';

@Component({
  selector: 'lib-adapt-h-element',
  templateUrl: './h-element.component.html',
  styleUrls: ['./h-element.component.scss'],
})
export class HElementComponent {
  @Input() formGroup?: FormGroup;
  @Input() controlName = '';
  @Input() ngClass = '';
  @Input() level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' = 'h1';
  @Input() editable = false;
}
