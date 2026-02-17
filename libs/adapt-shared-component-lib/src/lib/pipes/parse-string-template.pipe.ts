import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'parseStringTemplate',
  standalone: false,
})
export class ParseStringTemplatePipe implements PipeTransform {
  transform(template: string, variables: any): unknown {

    const parseRegex = /{{(.+?)}}/g;
    
    return template.replaceAll(parseRegex, (match, code) => variables[code.trim()]);
  }
}
