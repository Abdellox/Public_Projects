import { useCallback, useEffect, useMemo, useState } from 'react'
import type { VizPlayer, VizStep } from './types'

export function useVizPlayer(steps: VizStep[], initialSpeed = 4): VizPlayer {
  const total = steps.length
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeedState] = useState(initialSpeed)

  const step = useMemo<VizStep | undefined>(() => steps[index], [steps, index])
  const atEnd = total === 0 || index >= total - 1
  const atStart = index === 0

  useEffect(() => {
    if (playing && atEnd) setPlaying(false)
  }, [playing, atEnd])

  useEffect(() => {
    if (!playing || total === 0) return
    const delay = Math.max(20, 1100 / speed)
    const id = setInterval(() => {
      setIndex((current) => (current >= total - 1 ? current : current + 1))
    }, delay)
    return () => clearInterval(id)
  }, [playing, total, speed])

  const play = useCallback(() => {
    if (atEnd) setIndex(0)
    setPlaying(true)
  }, [atEnd])

  const pause = useCallback(() => setPlaying(false), [])

  const toggle = useCallback(() => {
    if (atEnd) {
      setIndex(0)
      setPlaying(true)
      return
    }
    setPlaying((prev) => !prev)
  }, [atEnd])

  const reset = useCallback(() => {
    setPlaying(false)
    setIndex(0)
  }, [])

  const stepForward = useCallback(() => {
    setPlaying(false)
    setIndex((current) => Math.min(current + 1, total - 1))
  }, [total])

  const stepBack = useCallback(() => {
    setPlaying(false)
    setIndex((current) => Math.max(current - 1, 0))
  }, [])

  const setSpeed = useCallback((value: number) => {
    setSpeedState(Math.max(1, Math.min(10, Math.round(value))))
  }, [])

  return {
    index,
    total,
    playing,
    speed,
    step,
    atStart,
    atEnd,
    play,
    pause,
    toggle,
    reset,
    stepForward,
    stepBack,
    setSpeed,
  }
}