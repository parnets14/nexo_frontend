import { useCallback, useEffect, useRef, useState, useMemo } from 'react'
import { useAdminAuth } from '../context/AdminAuthContext.jsx'

// Request cache to prevent duplicate calls
const requestCache = new Map()
const pendingRequests = new Map()

// Cache TTL (Time To Live) in milliseconds - 30 seconds
const CACHE_TTL = 30000

const getCacheKey = (fetcher, token, deps = []) => {
  // Create a unique key based on function name or string representation
  const funcStr = fetcher.toString()
  // Include deps in cache key to ensure different params generate different keys
  const depsStr = deps.length > 0 ? `-${JSON.stringify(deps)}` : ''
  return `${funcStr}-${token || 'no-token'}${depsStr}`
}

export const useAdminData = (fetcher, deps = []) => {
  const { token } = useAdminAuth()
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const fetcherRef = useRef(fetcher)
  const mountedRef = useRef(true)
  const cacheKeyRef = useRef(null)

  // Update fetcher ref when it changes
  useEffect(() => {
    fetcherRef.current = fetcher
  }, [fetcher])

  // Memoize cache key - include deps to ensure filter changes create new cache keys
  // Convert deps array to a stable string for comparison
  const depsString = useMemo(() => {
    if (!deps || deps.length === 0) return ''
    return JSON.stringify(deps)
  }, [deps])
  
  cacheKeyRef.current = useMemo(() => {
    if (!token) return null
    // Include deps in cache key to ensure different filter combinations get different cache entries
    return getCacheKey(fetcher, token, deps)
  }, [fetcher, token, depsString])

  const load = useCallback(async () => {
    if (!token || !cacheKeyRef.current) {
      setIsLoading(false)
      return
    }

    const cacheKey = cacheKeyRef.current

    // Check if there's a pending request for this key
    if (pendingRequests.has(cacheKey)) {
      // Wait for the pending request to complete
      try {
        const cachedData = await pendingRequests.get(cacheKey)
        if (mountedRef.current) {
          setData(cachedData)
          setIsLoading(false)
        }
        return
      } catch (err) {
        // If pending request failed, continue to make new request
      }
    }

    // Check cache first
    const cached = requestCache.get(cacheKey)
    if (cached) {
      const { data: cachedData, timestamp } = cached
      const age = Date.now() - timestamp
      
      // If cache is still fresh, use it
      if (age < CACHE_TTL) {
        if (mountedRef.current) {
          setData(cachedData)
          setIsLoading(false)
          setError(null)
        }
        return
      }
    }

    // Create a promise for this request
    const requestPromise = (async () => {
      try {
        if (mountedRef.current) {
          setIsLoading(true)
          setError(null)
        }
        
        const response = await fetcherRef.current(token)
        
        // Cache the response
        requestCache.set(cacheKey, {
          data: response,
          timestamp: Date.now()
        })
        
        if (mountedRef.current) {
          setData(response)
          setIsLoading(false)
          setError(null)
        }
        
        return response
      } catch (err) {
        const message = err?.message ?? 'Unable to fetch data'
        if (mountedRef.current) {
          setError(message)
          setIsLoading(false)
        }
        throw err
      } finally {
        // Remove from pending requests
        pendingRequests.delete(cacheKey)
      }
    })()

    // Store the promise so other calls can wait for it
    pendingRequests.set(cacheKey, requestPromise)

    // Wait for the request to complete
    await requestPromise
  }, [token])

  // Only run effect when token changes or deps change, not when fetcher changes
  useEffect(() => {
    mountedRef.current = true
    load()
    
    return () => {
      mountedRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, ...deps])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  // Manual refresh function that bypasses cache
  const refresh = useCallback(async () => {
    if (!token || !cacheKeyRef.current) return
    
    const cacheKey = cacheKeyRef.current
    
    // Clear cache for this key
    requestCache.delete(cacheKey)
    pendingRequests.delete(cacheKey)
    
    // Reload
    await load()
  }, [token, load])

  return { data, isLoading, error, refresh }
}

// Export function to clear all cache (useful for logout)
export const clearAdminDataCache = () => {
  requestCache.clear()
  pendingRequests.clear()
}
