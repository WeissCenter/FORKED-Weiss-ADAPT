import { AbstractControl, FormArray, FormControl, FormGroup, ValidationErrors } from '@angular/forms';
import { Observable, debounceTime, distinctUntilChanged, first, map, of, switchMap } from 'rxjs';
import { AdaptDataService } from '../services/adapt-data.service';
import { PageMode } from '@adapt/types';
import * as xlsx from 'xlsx';
export function uniqueNameValidator(type: string, data: AdaptDataService, pageMode = PageMode.CREATE, field='name') {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (pageMode === PageMode.VIEW || (pageMode === PageMode.EDIT && !control.dirty)) {
      return of(null);
    }
    return control.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap((val) =>
        data.isUnique(type, val, field).pipe(
          debounceTime(400),
          map((result: boolean) => (!result ? { uniqueName: true } : null))
        )
      ),
      first()
    );
  };
}

export function getFormErrors(form: AbstractControl) {
  if (form instanceof FormControl) {
    // Return FormControl errors or null
    return form.errors ?? null;
  }
  if (form instanceof FormGroup || form instanceof FormArray) {
    const groupErrors = form.errors;

    // Form group can contain errors itself, in that case add'em
    const formErrors: any = groupErrors ? { groupErrors } : {};
    Object.keys(form.controls).forEach((key) => {
      // Recursive call of the FormGroup fields
      const error = getFormErrors(form.get(key)!);
      if (error !== null) {
        // Only add error if not null
        formErrors[key] = error;
      }
    });
    // Return FormGroup errors or null
    return Object.keys(formErrors).length > 0 ? formErrors : null;
  }
}
