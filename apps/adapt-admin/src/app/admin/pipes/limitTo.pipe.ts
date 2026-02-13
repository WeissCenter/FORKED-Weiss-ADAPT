import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'limitTo',
  standalone: false,
})
export class LimitToPipe implements PipeTransform {
  transform(array: any[], limit: number): any[] {
    return array.slice(0, limit);
  }
}
