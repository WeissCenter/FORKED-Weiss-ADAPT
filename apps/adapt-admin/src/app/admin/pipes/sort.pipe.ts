import { getField } from '@adapt/types';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sort',
  pure: false,
})
export class SortPipe implements PipeTransform {
  transform(dt: any[], way: 'asc' | 'desc', field?: string): any[] {
    const data = structuredClone(dt);
    if (!field && way === 'desc') {
      return data.sort().reverse();
    }
    if (!field && way === 'asc') {
      return data.sort();
    }

    return data.sort((a: any, b: any) => {
      const aSelect = getField(field as string, a);
      const bSelect = getField(field as string, b);

      const type = typeof aSelect;

      const left = way === 'asc' ? aSelect : bSelect;
      const right = way === 'asc' ? bSelect : aSelect;

      switch (type) {
        case 'string': {
          return left.localeCompare(right);
        }
        default: {
          return left - right;
        }
      }
    });
  }
}
