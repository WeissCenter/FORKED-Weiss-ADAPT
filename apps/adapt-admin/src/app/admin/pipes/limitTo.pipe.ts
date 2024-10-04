import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'limitTo',
})
export class LimitToPipe implements PipeTransform {
  transform(array: any[], limit: number): any[] {
    return array.slice(0, limit);
  }
}
