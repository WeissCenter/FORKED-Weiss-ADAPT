import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'valueLabel',
})
export class ValueLabelPipe implements PipeTransform {
  transform(value: any, array: any[], valField = 'value', labelField = 'label', def?: string): unknown {
    return array.find((opt) => opt[valField] === value)?.[labelField] ?? def ?? value;
  }
}
