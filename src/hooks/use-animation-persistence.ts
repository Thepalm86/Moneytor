'use client'

import { useRef, useEffect } from 'react'

/**
 * Hook to prevent animations from restarting when component re-mounts
 * due to tab switching or browser optimizations
 */
export function useAnimationPersistence(key?: string) {
  const hasAnimatedRef = useRef(false)
  const mountTimeRef = useRef(Date.now())

  useEffect(() => {
    // Check if we've animated before using sessionStorage
    const storageKey = key ? `animation-${key}` : `animation-${mountTimeRef.current}`
    const hasAnimatedBefore = sessionStorage.getItem(storageKey)
    
    if (hasAnimatedBefore) {
      hasAnimatedRef.current = true
    } else {
      // Mark as animated after first render
      const timer = setTimeout(() => {
        hasAnimatedRef.current = true
        sessionStorage.setItem(storageKey, 'true')
      }, 1000) // Wait 1 second for animations to complete
      
      return () => clearTimeout(timer)
    }
  }, [key])

  return {
    shouldAnimate: !hasAnimatedRef.current,
    markAnimated: () => {
      hasAnimatedRef.current = true
      if (key) {
        sessionStorage.setItem(`animation-${key}`, 'true')
      }
    },
    hasAnimated: hasAnimatedRef.current
  }
}

/**
 * Hook for components that should only animate once per session
 */
export function useSessionAnimation(componentName: string) {
  return useAnimationPersistence(componentName)
}

/**
 * Hook for viewport-based animations that shouldn't repeat
 */
export function useViewportAnimation(componentName: string) {
  const { shouldAnimate, hasAnimated } = useAnimationPersistence(componentName)
  
  return {
    initial: shouldAnimate ? { opacity: 0, y: 20 } : false,
    animate: { opacity: 1, y: 0 },
    transition: shouldAnimate ? { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] } : { duration: 0 },
    hasAnimated
  }
}

/**
 * Hook for stagger animations that shouldn't repeat
 */
export function useStaggerAnimation(componentName: string, childCount: number = 0) {
  const { shouldAnimate } = useAnimationPersistence(componentName)
  
  return {
    container: {
      initial: shouldAnimate ? 'hidden' : 'visible',
      animate: 'visible',
      variants: {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: shouldAnimate ? 0.1 : 0,
            delayChildren: shouldAnimate ? 0.1 : 0
          }
        }
      }
    },
    child: {
      variants: {
        hidden: { opacity: 0, y: 20 },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: { duration: shouldAnimate ? 0.4 : 0 }
        }
      }
    }
  }
}

/**
 * Hook for hover animations that should always work
 */
export function useHoverAnimation() {
  return {
    whileHover: { scale: 1.02, y: -2 },
    whileTap: { scale: 0.98 },
    transition: { type: "spring", stiffness: 400, damping: 17 }
  }
}

/**
 * Clean up animation persistence data (call on app initialization)
 */
export function cleanupAnimationStorage() {
  const keys = Object.keys(sessionStorage)
  keys.forEach(key => {
    if (key.startsWith('animation-')) {
      sessionStorage.removeItem(key)
    }
  })
}