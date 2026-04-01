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
  teamA: Player[]
  teamB: Player[]
}

export type StatKey =  'level' | 'wins' | 'losses' | 'queuePosition' | 'isQueued' | 'id'
export type ButtonKey = 'addQueue' | 'removeList'


