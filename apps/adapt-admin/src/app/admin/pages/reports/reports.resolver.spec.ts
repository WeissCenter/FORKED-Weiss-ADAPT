import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { reportsResolver } from './reports.resolver';

describe('reportsResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) =>
    TestBed.runInInjectionContext(() => reportsResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
