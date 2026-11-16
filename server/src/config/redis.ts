import RedisPackage from 'ioredis';
import { config } from './env.js';

// Compatible constructor import for both ESM and CJS bundling
const Redis = (RedisPackage as any).default || RedisPackage;

class MemoryCacheFallback {
  private cache = new Map<string, { value: string; expiresAt?: number }>();

  async get(key: string): Promise<string | null> {
    const item = this.cache.get(key);
    if (!item) return null;
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return item.value;
  }

  async set(key: string, value: string, mode?: string, duration?: number): Promise<'OK'> {
    let expiresAt: number | undefined;
    if (mode === 'EX' && duration) {
      expiresAt = Date.now() + duration * 1000;
    } else if (mode === 'PX' && duration) {
      expiresAt = Date.now() + duration;
    }
    this.cache.set(key, { value, expiresAt });
    return 'OK';
  }

  async del(key: string): Promise<number> {
    const deleted = this.cache.delete(key);
    return deleted ? 1 : 0;
  }
}

const memoryFallback = new MemoryCacheFallback();
let isRedisConnected = false;

export const redis = new (Redis as any)(config.redis.url, {
  maxRetriesPerRequest: 1,
  retryStrategy(times: number) {
    if (times > 3) {
      return null; // Stop retrying and fallback to in-memory cache
    }
    return Math.min(times * 100, 1000);
  },
  lazyConnect: true,
});

redis.on('connect', () => {
  isRedisConnected = true;
  console.log('[Redis] Connected successfully');
});

redis.on('error', (err: any) => {
  if (isRedisConnected) {
    console.warn('[Redis] Connection lost, falling back to in-memory cache');
  }
  isRedisConnected = false;
});

// Attempt initial connection without blocking app startup
redis.connect().catch(() => {
  // Silence initial offline error; fallback is active
});

export const cacheService = {
  async get(key: string): Promise<string | null> {
    if (isRedisConnected) {
      try {
        return await redis.get(key);
      } catch {
        return memoryFallback.get(key);
      }
    }
    return memoryFallback.get(key);
  },

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (isRedisConnected) {
      try {
        if (ttlSeconds) {
          await redis.set(key, value, 'EX', ttlSeconds);
        } else {
          await redis.set(key, value);
        }
        return;
      } catch {
        // Fallback below
      }
    }
    if (ttlSeconds) {
      await memoryFallback.set(key, value, 'EX', ttlSeconds);
    } else {
      await memoryFallback.set(key, value);
    }
  },

  async del(key: string): Promise<void> {
    if (isRedisConnected) {
      try {
        await redis.del(key);
        return;
      } catch {
        // Fallback below
      }
    }
    await memoryFallback.del(key);
  },
};
