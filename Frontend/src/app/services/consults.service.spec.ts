import { TestBed } from '@angular/core/testing';

import { ConsultsService } from './consults.service';

describe('ConsultsService', () => {
  let service: ConsultsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConsultsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
