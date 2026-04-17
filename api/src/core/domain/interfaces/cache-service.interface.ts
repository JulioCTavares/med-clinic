export const CACHE_SERVICE = Symbol('ICacheService');

export interface ICacheService {
  set(key: string, value: string, ttl?: number): Promise<void>;
  get(key: string): Promise<string | null>;
  del(key: string): Promise<void>;
}
