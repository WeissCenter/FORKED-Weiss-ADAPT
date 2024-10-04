import { IGlossaryTerm } from '@adapt/types';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GlossaryService {
  private _glossary = new BehaviorSubject<{[key: string]: IGlossaryTerm}>({});

  constructor(private http: HttpClient) {
    this.http
      .get('assets/terms/glossary.json')
      .subscribe((result) => this.registerJSON(result as { [key: string]: IGlossaryTerm }));
  }

  public registerJSON(values: { [key: string]: IGlossaryTerm }) {
    this._glossary.next(values)
  }

  public registerTerm(key: string, value: IGlossaryTerm) {
    const currValue = this._glossary.getValue();
    currValue[key] = value;
    this._glossary.next(currValue)
  }



  public hasTerm(key: string) {
    return key in this.currValue;
  }

  public getTermSafe(key: string, def?: string): IGlossaryTerm {
    if (!this.hasTerm(key)) {
      return { label: def || key, definition: '' };
    }

    return this.currValue[key] as IGlossaryTerm;
  }

  public getTerm(key: string): IGlossaryTerm | undefined {
    return this.currValue[key] as IGlossaryTerm;
  }

  public getTermObservable(key: string){
    return this._glossary.asObservable().pipe(map(glossary => glossary[key]))
  }


  private get currValue(){
    return this._glossary.getValue();
  }

}
