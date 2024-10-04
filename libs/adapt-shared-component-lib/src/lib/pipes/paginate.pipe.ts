import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'paginate',
})
export class PaginatePipe implements PipeTransform {
  transform(items: any[] | null, page: number, pageSize: number): any[] {
    return items?.slice((page - 1) * pageSize, page * pageSize) || [];
  }
}
