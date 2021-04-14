import { TestBed } from '@angular/core/testing';

import { DaveeproService } from './daveepro.service';

describe('DaveeproService', () => {
  let service: DaveeproService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DaveeproService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
