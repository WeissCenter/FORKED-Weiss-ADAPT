import { Inject, Pipe, PipeTransform } from '@angular/core';
import { GlossaryService } from '../services/glossary.service';
import { IGlossaryTerm } from '@adapt/types';
import { map, Observable, of } from 'rxjs';

@Pipe({
  name: 'glossary'
})
export class GlossaryPipe implements PipeTransform {
  constructor(@Inject(GlossaryService) private glossary: GlossaryService) {}

  transform(key: string, field?: 'label' | 'definition'): Observable<string> {

    return this.glossary.getTermObservable(key)
    .pipe(map(term => {
      return term ? term[field || 'label'] : key;
    }));

  }
}
