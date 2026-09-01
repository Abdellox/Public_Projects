/** A single discrete frame in an algorithm visualization. */
export interface VizStep {
  /** Human-readable description of the operation that produced this step. */
  description: string
  [key: string]: unknown
}

export interface VizPlayer {
  index: number
  total: number
  playing: boolean
  speed: number
  step: VizStep | undefined
  atStart: boolean
  atEnd: boolean
  play: () => void
  pause: () => void
  toggle: () => void
  reset: () => void
  stepForward: () => void
  stepBack: () => void
  setSpeed: (speed: number) => void
}