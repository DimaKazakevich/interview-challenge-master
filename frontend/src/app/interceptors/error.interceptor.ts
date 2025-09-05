import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

export function errorInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        const normalizedMessage = extractErrorMessage(error);
        const normalized = new HttpErrorResponse({
          error: normalizedMessage,
          headers: error.headers,
          status: error.status,
          statusText: error.statusText,
          url: error.url ?? undefined,
        });
        return throwError(() => normalized);
      }
      return throwError(() => error);
    })
  );
}

function extractErrorMessage(err: HttpErrorResponse): string {
  const fallback = 'Unexpected error';
  const body = err.error;
  if (!body) return fallback;
  if (typeof body === 'string') return body || fallback;
  if (typeof body === 'object') {
    const maybeMessage = (body as { message?: unknown; error?: unknown }).message ?? (body as { error?: unknown }).error;
    if (typeof maybeMessage === 'string') return maybeMessage;
  }
  return fallback;
} 