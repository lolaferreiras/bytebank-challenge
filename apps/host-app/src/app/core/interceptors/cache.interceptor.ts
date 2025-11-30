import { HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CacheService } from '../services/cache.service';

export const cacheInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next) => {
  const cache = inject(CacheService);

  
  const excludedPaths = ['/account/transaction'];
  const hasSkipHeader = req.headers.has('x-skip-cache');
  const isExcludedPath = excludedPaths.some(p => req.url.includes(p));
  if (hasSkipHeader || isExcludedPath) {
    console.debug('[cache] BYPASS for', req.method, req.urlWithParams, hasSkipHeader ? '(skip header)' : '(excluded path)');
    return next(req);
  }

  
  if (req.method !== 'GET') {
    return next(req).pipe(
      tap((event) => {
        if (event instanceof HttpResponse) {
          // For write operations invalidate cache for the affected URL
          if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
            cache.invalidateUrl(req.url);
          }
        }
      }) as any
    );
  }

  const shouldCache = /api|account|transaction|balance/i.test(req.url);
  if (!shouldCache) {
    return next(req);
  }

  const cached = cache.get(req);
  if (cached) {
    // Debug: cache hit
    console.debug('[cache] HIT', req.method, req.urlWithParams);
    // Return cached HttpResponse as an observable
    return of(cached.clone());
  }

  console.debug('[cache] MISS', req.method, req.urlWithParams);

  return next(req).pipe(
    tap((event) => {
      if (event instanceof HttpResponse) {
        // Only cache successful responses (2xx). Avoid caching 401/403/5xx errors.
        const status = event.status ?? 0;
        if (status >= 200 && status < 300) {
          cache.set(req, event);
          console.debug('[cache] STORE', req.method, req.urlWithParams, 'status=', status);
        } else {
          console.debug('[cache] SKIP_CACHING_STATUS', req.method, req.urlWithParams, 'status=', status);
        }
      }
    }) as any
  );
};
