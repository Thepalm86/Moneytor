'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { dataCache, createCacheKey } from '@/lib/data-cache'

interface UseCachedDataOptions {
  ttl?: number // Cache time-to-live in milliseconds
  enabled?: boolean // Whether to fetch data
  staleWhileRevalidate?: boolean // Return stale data while fetching fresh
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
}

export function useCachedData<T>(
  key: string | (string | number)[],
  fetcher: () => Promise<T>,
  options: UseCachedDataOptions = {}
) {
  const {
    ttl = 300000, // 5 minutes default
    enabled = true,
    staleWhileRevalidate = true,
    onSuccess,
    onError
  } = options

  const cacheKey = Array.isArray(key) ? createCacheKey(...key) : key
  const [data, setData] = useState<T | null>(() => dataCache.get<T>(cacheKey))
  const [loading, setLoading] = useState(!dataCache.has(cacheKey))
  const [error, setError] = useState<any>(null)
  const fetcherRef = useRef(fetcher)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Update fetcher ref when it changes
  fetcherRef.current = fetcher

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!enabled) return

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Check cache first
    const cachedData = dataCache.get<T>(cacheKey)
    if (cachedData && !forceRefresh) {
      setData(cachedData)
      setLoading(false)
      return cachedData
    }

    // If we have stale data, show it while fetching fresh
    if (cachedData && staleWhileRevalidate && !forceRefresh) {
      setData(cachedData)
      setLoading(false)
    } else {
      setLoading(true)
    }

    try {
      abortControllerRef.current = new AbortController()
      
      const freshData = await fetcherRef.current()
      
      // Cache the fresh data
      dataCache.set(cacheKey, freshData, ttl)
      setData(freshData)
      setError(null)
      
      if (onSuccess) {
        onSuccess(freshData)
      }
      
      return freshData
    } catch (err: any) {
      // Don't update error state if request was aborted
      if (err.name !== 'AbortError') {
        setError(err)
        if (onError) {
          onError(err)
        }
      }
      throw err
    } finally {
      setLoading(false)
      abortControllerRef.current = null
    }
  }, [cacheKey, enabled, ttl, staleWhileRevalidate, onSuccess, onError])

  // Subscribe to cache updates
  useEffect(() => {
    const unsubscribe = dataCache.subscribe(cacheKey, () => {
      const updatedData = dataCache.get<T>(cacheKey)
      if (updatedData) {
        setData(updatedData)
      }
    })

    return unsubscribe
  }, [cacheKey])

  // Initial data fetch
  useEffect(() => {
    if (enabled && !dataCache.has(cacheKey)) {
      fetchData()
    }
  }, [cacheKey, enabled, fetchData])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  const mutate = useCallback(async (newData?: T, shouldRevalidate = true) => {
    if (newData !== undefined) {
      dataCache.set(cacheKey, newData, ttl)
      setData(newData)
    }
    
    if (shouldRevalidate) {
      return fetchData(true)
    }
  }, [cacheKey, ttl, fetchData])

  const invalidate = useCallback(() => {
    dataCache.invalidate(cacheKey)
    setData(null)
    setError(null)
  }, [cacheKey])

  return {
    data,
    loading,
    error,
    mutate,
    invalidate,
    refetch: () => fetchData(true),
    isValidating: loading && data !== null
  }
}