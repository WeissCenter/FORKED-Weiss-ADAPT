import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterMissingProperty',
  standalone: false,
})
export class FilterMissingPropertyPipe implements PipeTransform {
  transform(items?: any[], propertyName?: string): any[] {
    if (!items) return [];
    if (!propertyName) return items;
    return items.filter(
      (item) =>
        item.hasOwnProperty(propertyName) &&
        item[propertyName] !== null &&
        item[propertyName] !== undefined &&
        item[propertyName] !== ''
    );
  }
}
