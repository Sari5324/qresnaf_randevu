'use client'

import { useEffect, useRef } from 'react'

interface ViewTrackerProps {
  appointmentId: string | null
}

export default function ViewTracker({ appointmentId }: ViewTrackerProps) {
  const trackedRef = useRef<Set<string>>(new Set())
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    const trackingId = appointmentId || 'homepage'
    
    // Check if this item was already tracked in this session
    if (trackedRef.current.has(trackingId)) {
      return
    }

    // Debounce the tracking to prevent duplicate calls
    timeoutRef.current = setTimeout(async () => {
      try {
        // Mark as tracked before making the request
        trackedRef.current.add(trackingId)
        
        await fetch('/api/track-view', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            appointmentId: appointmentId || null
          }),
        })
      } catch (error) {
        console.error('View tracker error:', error)
        // Remove from tracked set if request failed
        trackedRef.current.delete(trackingId)
      }
    }, 100) // 100ms debounce

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [appointmentId])

  return null // This component doesn't render anything
}
