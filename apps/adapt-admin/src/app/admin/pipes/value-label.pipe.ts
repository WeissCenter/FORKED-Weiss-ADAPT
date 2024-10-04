import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'valueLabel',
})
export class ValueLabelPipe implements PipeTransform {
  transform(value: any, array: { value: any; label: string }[], def?: string): unknown {
    return array.find((opt) => opt.value === value)?.label ?? def ?? value;
  }
}
