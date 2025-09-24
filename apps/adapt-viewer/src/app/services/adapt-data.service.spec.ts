import { TestBed } from '@angular/core/testing';

import { AdaptDataService } from './adapt-data.service';

describe('AdaptDataService', () => {
  let service: AdaptDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdaptDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
