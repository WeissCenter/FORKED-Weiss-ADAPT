import { Pipe, PipeTransform } from '@angular/core';
import { GlossaryService } from '../services/glossary.service';
import { IGlossaryTerm, LanguageCode } from '@adapt/types';

@Pipe({
  name: 'glossary',
  standalone: false,
})
export class GlossaryPipe implements PipeTransform {
  constructor(private glossary: GlossaryService) {}

  transform(key: string, field: 'label' | 'definition' = 'label', lang: string = 'en', fileSpec?: string) {
    let term: IGlossaryTerm | undefined;
    if (fileSpec) {
      term = this.glossary.getFileSpecTerm(fileSpec.toLowerCase(), key, (lang as LanguageCode));
    } else {
      term = this.glossary.getTerm(key, (lang as LanguageCode));
    }
    // return term ? term[field] : key;
    return new Promise<string>((resolve) => {
      if (term) {
        resolve(term[field]);
      } else {
        resolve(key);
      }
    });
  }
}
