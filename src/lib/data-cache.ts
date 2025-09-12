// Data caching system to prevent unnecessary re-fetching
interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

class DataCache {
  private cache = new Map<string, CacheEntry<any>>()
  private subscribers = new Map<string, Set<() => void>>()

  set<T>(key: string, data: T, ttl: number = 300000): void { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
    
    // Notify subscribers of cache update
    const subs = this.subscribers.get(key)
    if (subs) {
      subs.forEach(callback => callback())
    }
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null
    
    if (this.isExpired(key)) {
      this.cache.delete(key)
      return null
    }
    
    return entry.data
  }

  has(key: string): boolean {
    return this.cache.has(key) && !this.isExpired(key)
  }

  isExpired(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return true
    return Date.now() - entry.timestamp > entry.ttl
  }

  invalidate(key: string): void {
    this.cache.delete(key)
    // Notify subscribers of invalidation
    const subs = this.subscribers.get(key)
    if (subs) {
      subs.forEach(callback => callback())
    }
  }

  invalidatePattern(pattern: string): void {
    const keys = Array.from(this.cache.keys())
    keys.forEach(key => {
      if (key.includes(pattern)) {
        this.invalidate(key)
      }
    })
  }

  subscribe(key: string, callback: () => void): () => void {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set())
    }
    this.subscribers.get(key)!.add(callback)
    
    // Return unsubscribe function
    return () => {
      const subs = this.subscribers.get(key)
      if (subs) {
        subs.delete(callback)
        if (subs.size === 0) {
          this.subscribers.delete(key)
        }
      }
    }
  }

  clear(): void {
    this.cache.clear()
    this.subscribers.clear()
  }

  // Get cache stats for debugging
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      subscribers: this.subscribers.size
    }
  }
}

export const dataCache = new DataCache()

// Helper function to create cache keys
export const createCacheKey = (...parts: (string | number)[]): string => {
  return parts.filter(Boolean).join(':')
}