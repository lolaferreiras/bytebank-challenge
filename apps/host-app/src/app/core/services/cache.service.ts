import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse } from '@angular/common/http';

type CacheEntry = {
  url: string;
  response: HttpResponse<any>;
  expiry: number;
};

@Injectable({ providedIn: 'root' })
export class CacheService {
  private cache = new Map<string, CacheEntry>();
  // default TTL (ms)
  private defaultTTL = 60_000; // 60s

  private makeKey(req: HttpRequest<any>): string {
    // include auth token in key to avoid sharing across users
    const token = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('authToken') : '';
    return `${req.method}|${req.urlWithParams}|${token ?? ''}`;
  }

  get(req: HttpRequest<any>): HttpResponse<any> | null {
    const key = this.makeKey(req);
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    return entry.response;
  }

  set(req: HttpRequest<any>, response: HttpResponse<any>, ttlMs?: number) {
    const key = this.makeKey(req);
    const expiry = Date.now() + (ttlMs ?? this.defaultTTL);
    this.cache.set(key, { url: req.urlWithParams, response, expiry });
  }

  invalidateUrl(url: string) {
    for (const [key, entry] of this.cache.entries()) {
      if (entry.url.includes(url)) {
        this.cache.delete(key);
      }
    }
  }

  clear() {
    this.cache.clear();
  }
}
