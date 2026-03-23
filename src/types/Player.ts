export interface Player {
  name: string
  level: 1 | 2 | 3
  wins: number
  losses: number
  queuePosition?: number
  isQueued?: boolean
  isPlaying?: boolean

}

export type StatKey =  'level' | 'wins' | 'losses' | 'queuePosition' | 'isQueued'
export type ButtonKey = 'addQueue' | 'removeList'


