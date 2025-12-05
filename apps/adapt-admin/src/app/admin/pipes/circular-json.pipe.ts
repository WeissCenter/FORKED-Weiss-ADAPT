import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'circularJson',
  standalone: false,
})
export class CircularJsonPipe implements PipeTransform {
  transform(value: any): unknown {
    const getCircularReplacer = () => {
      const seen = new WeakSet();
      return (key: string, value: any) => {
        if (typeof value === 'object' && value !== null) {
          if (seen.has(value)) {
            return;
          }
          seen.add(value);
        }
        return value;
      };
    };

    return JSON.stringify(value, getCircularReplacer());
  }
}
