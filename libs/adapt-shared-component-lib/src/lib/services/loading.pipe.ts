import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Pipe, PipeTransform } from '@angular/core';
import { Observable, from, isObservable, of, switchMap, catchError, map, startWith, delay } from 'rxjs';

@Pipe({ name: 'loading' })
export class LoadingPipe implements PipeTransform {
  constructor(private announcer: LiveAnnouncer) {}
  transform(val: any, liveAnnounce?: string): Observable<any> {
    if (val instanceof Promise) {
      val = from(val);
    }
    if (!isObservable(val)) {
      return of({ loading: false, value: val });
    }

    return val.pipe(
      delay(250),
      map((value) => {
        if (Array.isArray(value) && value.length && liveAnnounce) this.announcer.announce(liveAnnounce);

        return { loading: false, value };
      }),
      startWith({ loading: true }),
      catchError((error) => of({ loading: false, error }))
    );
  }
}
