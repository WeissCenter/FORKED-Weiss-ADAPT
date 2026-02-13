import { Pipe, PipeTransform } from '@angular/core';
import { GlossaryService } from '../services/glossary.service';
import { LanguageCode } from '@adapt/types';
import { Observable, map } from 'rxjs';

@Pipe({
  name: 'glossary',
  standalone: false,
})
export class GlossaryPipe implements PipeTransform {
  constructor(private glossary: GlossaryService) {}

  transform(key: string, field: 'label' | 'definition' = 'label', lang: string = 'en', fileSpec?: string): Observable<string> {
    return this.glossary.getGlossaryTerm$(key, lang as LanguageCode, fileSpec).pipe(
      map((term) => term ? term[field] : key)
    );
  }
}
