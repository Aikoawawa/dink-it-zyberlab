export interface Player {
  name: string
  id: number
  level: 1 | 2 | 3
  wins: number
  losses: number
  queuePosition?: number
  isQueued?: boolean
  isPlaying?: boolean


}

export interface Match {
  id:number
  format: QueueFormat
  teamA: Player[]
  teamB: Player[]
}

export type StatKey =  'level' | 'wins' | 'losses' | 'queuePosition' | 'isQueued' | 'id'
export type ButtonKey = 'addQueue' | 'removeList'
export type QueueFormat ='singles' | 'doubles'
export type MatchGenerateMode = 'auto' | 'manual'
