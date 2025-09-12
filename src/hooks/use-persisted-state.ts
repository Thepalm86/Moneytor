'use client'

import { useState, useEffect, useCallback } from 'react'

/**
 * Hook for persisting non-critical UI state in sessionStorage
 * Perfect for filters, view modes, sidebar states, etc.
 */
export function usePersistedState<T>(
  key: string, 
  defaultValue: T,
  options: {
    storage?: 'localStorage' | 'sessionStorage'
    serialize?: boolean
  } = {}
) {
  const { 
    storage = 'sessionStorage',
    serialize = true 
  } = options

  // Initialize state from storage or default
  const [state, setState] = useState<T>(() => {
    try {
      if (typeof window === 'undefined') return defaultValue

      const storageObj = storage === 'localStorage' ? localStorage : sessionStorage
      const item = storageObj.getItem(key)
      
      if (item === null) return defaultValue
      
      return serialize ? JSON.parse(item) : item
    } catch (error) {
      console.warn(`Error reading ${storage} key "${key}":`, error)
      return defaultValue
    }
  })

  // Update storage when state changes
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return

      const storageObj = storage === 'localStorage' ? localStorage : sessionStorage
      const value = serialize ? JSON.stringify(state) : state as string
      storageObj.setItem(key, value)
    } catch (error) {
      console.warn(`Error setting ${storage} key "${key}":`, error)
    }
  }, [key, state, storage, serialize])

  // Clear function
  const clear = useCallback(() => {
    try {
      if (typeof window === 'undefined') return

      const storageObj = storage === 'localStorage' ? localStorage : sessionStorage
      storageObj.removeItem(key)
      setState(defaultValue)
    } catch (error) {
      console.warn(`Error removing ${storage} key "${key}":`, error)
    }
  }, [key, defaultValue, storage])

  return [state, setState, clear] as const
}

/**
 * Hook for persisting UI state only for the current session
 */
export function useSessionState<T>(key: string, defaultValue: T) {
  return usePersistedState(key, defaultValue, { storage: 'sessionStorage' })
}

/**
 * Hook for persisting UI state across browser sessions
 */
export function useLocalState<T>(key: string, defaultValue: T) {
  return usePersistedState(key, defaultValue, { storage: 'localStorage' })
}

/**
 * Hook for persisting view preferences (filters, sort, layout, etc.)
 */
export function useViewPreferences<T extends Record<string, any>>(
  componentName: string,
  defaultPreferences: T
) {
  const [preferences, setPreferences, clearPreferences] = useSessionState(
    `view-${componentName}`,
    defaultPreferences
  )

  const updatePreference = useCallback(<K extends keyof T>(
    key: K,
    value: T[K]
  ) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }))
  }, [setPreferences])

  const resetPreferences = useCallback(() => {
    setPreferences(defaultPreferences)
  }, [setPreferences, defaultPreferences])

  return {
    preferences,
    setPreferences,
    updatePreference,
    resetPreferences,
    clearPreferences
  }
}

/**
 * Hook for persisting filter state
 */
export function useFilterState<T extends Record<string, any>>(
  filterName: string,
  defaultFilters: T
) {
  const [filters, setFilters, clearFilters] = useSessionState(
    `filters-${filterName}`,
    defaultFilters
  )

  const updateFilter = useCallback(<K extends keyof T>(
    key: K,
    value: T[K]
  ) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }, [setFilters])

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters)
  }, [setFilters, defaultFilters])

  const hasActiveFilters = useCallback(() => {
    return Object.entries(filters).some(([key, value]) => {
      const defaultValue = defaultFilters[key as keyof T]
      return JSON.stringify(value) !== JSON.stringify(defaultValue)
    })
  }, [filters, defaultFilters])

  return {
    filters,
    setFilters,
    updateFilter,
    resetFilters,
    clearFilters,
    hasActiveFilters: hasActiveFilters()
  }
}

/**
 * Clean up all persisted state for a specific prefix
 */
export function cleanupPersistedState(prefix: string) {
  try {
    if (typeof window === 'undefined') return

    // Clean sessionStorage
    const sessionKeys = Object.keys(sessionStorage)
    sessionKeys.forEach(key => {
      if (key.startsWith(prefix)) {
        sessionStorage.removeItem(key)
      }
    })

    // Clean localStorage
    const localKeys = Object.keys(localStorage)
    localKeys.forEach(key => {
      if (key.startsWith(prefix)) {
        localStorage.removeItem(key)
      }
    })
  } catch (error) {
    console.warn('Error cleaning up persisted state:', error)
  }
}