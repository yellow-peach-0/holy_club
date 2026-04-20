'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

export function useStopwatch() {
  const [elapsed, setElapsed] = useState(0)
  const [running, setRunning] = useState(false)
  const startTimeRef = useRef<number | null>(null)
  const accumRef = useRef(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const tick = useCallback(() => {
    if (startTimeRef.current !== null) {
      const now = Date.now()
      setElapsed(accumRef.current + Math.floor((now - startTimeRef.current) / 1000))
    }
  }, [])

  const start = useCallback(() => {
    if (!running) {
      startTimeRef.current = Date.now()
      setRunning(true)
      intervalRef.current = setInterval(tick, 500)
    }
  }, [running, tick])

  const pause = useCallback(() => {
    if (running && startTimeRef.current !== null) {
      accumRef.current += Math.floor((Date.now() - startTimeRef.current) / 1000)
      startTimeRef.current = null
      setRunning(false)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [running])

  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    startTimeRef.current = null
    accumRef.current = 0
    setElapsed(0)
    setRunning(false)
  }, [])

  const toggle = useCallback(() => {
    if (running) {
      pause()
    } else {
      start()
    }
  }, [running, start, pause])

  const getElapsed = useCallback(() => {
    if (running && startTimeRef.current !== null) {
      return accumRef.current + Math.floor((Date.now() - startTimeRef.current) / 1000)
    }
    return accumRef.current
  }, [running])

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return { elapsed, running, start, pause, reset, toggle, getElapsed }
}
