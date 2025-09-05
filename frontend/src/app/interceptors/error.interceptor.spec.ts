import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { errorInterceptor } from './error.interceptor';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

describe('errorInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should normalize string error', (done) => {
    http.get('/test').subscribe({
      next: () => done.fail('should error'),
      error: (err: HttpErrorResponse) => {
        expect(err.error).toBe('Bad things happened');
        done();
      },
    });

    const req = httpMock.expectOne('/test');
    req.flush('Bad things happened', { status: 400, statusText: 'Bad Request' });
  });

  it('should normalize object error with message field', (done) => {
    http.get('/test2').subscribe({
      next: () => done.fail('should error'),
      error: (err: HttpErrorResponse) => {
        expect(err.error).toBe('Human readable message');
        done();
      },
    });

    const req = httpMock.expectOne('/test2');
    req.flush({ message: 'Human readable message' }, { status: 500, statusText: 'Server Error' });
  });
}); 