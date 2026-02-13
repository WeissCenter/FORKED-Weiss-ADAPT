import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fieldLengthSort',
  standalone: false,
})
export class FieldLengthSortPipe implements PipeTransform {
  transform(array: any[], field: string, direction: 'asc' | 'desc' = 'asc'): any[] {
    return array.sort((a, b) => {
      return direction === 'asc' ? a[field].length - b[field].length : b[field].length - a[field].length;
    });
  }
}
