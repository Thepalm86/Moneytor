'use client';

import { useState, useEffect } from 'react'

/**
 * Custom hook to handle Zustand store hydration in Next.js
 * Prevents hydration mismatches by ensuring store is ready before rendering
 */
export function useStoreHydration() {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    // Mark as hydrated after first client-side render
    setIsHydrated(true)
  }, [])

  return isHydrated
}