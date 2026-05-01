import { defineStore } from 'pinia'
import { reactive, ref, computed, watch } from 'vue'

type Player = {
  id: number
  name: string
  level: number
  wins: number
  losses: number
  queuePosition?: number
}

type Match = {
  id: number
  format: 'singles' | 'doubles'
  teamA: Player[]
  teamB: Player[]
  winner: 'A' | 'B' | null
}

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export const usePickleballStore = defineStore('pickleball', () => {
  // State — hydrated from localStorage
  const playersList = reactive<Player[]>(load('pkl_players', []))
  const playerQueue = reactive<Player[]>(load('pkl_queue', []))
  const playerMatches = reactive<Match[]>(load('pkl_matches', []))
  const queueFormat = ref<'singles' | 'doubles'>(load('pkl_format', 'doubles'))

  let nextPlayerId = load<number>('pkl_next_player_id', 1)
  let nextMatchId = load<number>('pkl_next_match_id', 1)

  // Computed
  const teamSize = computed(() => queueFormat.value === 'singles' ? 1 : 2)
  const requiredPlayers = computed(() => queueFormat.value === 'singles' ? 2 : 4)

  // Persist on change
  watch(playersList, (v) => localStorage.setItem('pkl_players', JSON.stringify(v)), { deep: true })
  watch(playerQueue, (v) => localStorage.setItem('pkl_queue', JSON.stringify(v)), { deep: true })
  watch(playerMatches, (v) => localStorage.setItem('pkl_matches', JSON.stringify(v)), { deep: true })
  watch(queueFormat, (v) => localStorage.setItem('pkl_format', JSON.stringify(v)))

  // Actions
  function addPlayerToList(name: string, level: number) {
    if (!name) return
    playersList.push({ id: nextPlayerId++, name, level, wins: 0, losses: 0 })
    localStorage.setItem('pkl_next_player_id', JSON.stringify(nextPlayerId))
  }

  function deletePlayerToList(p: Player) {
    const i = playersList.indexOf(p)
    if (i !== -1) playersList.splice(i, 1)
  }

  function updateQueue() {
    playerQueue.forEach((p, i) => p.queuePosition = i)
  }

  function addPlayerToQueue(p: Player) {
    if (playerQueue.find(x => x.id === p.id)) return
    playerQueue.push(p)
    updateQueue()
  }

  function deletePlayerToQueue(p: Player) {
    const i = playerQueue.indexOf(p)
    if (i !== -1) { playerQueue.splice(i, 1); updateQueue() }
  }

  function generateAutoMatch() {
    if (playerQueue.length < requiredPlayers.value) return

    const selected = playerQueue.slice(0, requiredPlayers.value)
    playerMatches.push({
      id: nextMatchId++,
      format: queueFormat.value,
      teamA: selected.slice(0, teamSize.value),
      teamB: selected.slice(teamSize.value),
      winner: null
    })
    localStorage.setItem('pkl_next_match_id', JSON.stringify(nextMatchId))

    selected.forEach(p => {
      const i = playerQueue.findIndex(x => x.id === p.id)
      if (i !== -1) playerQueue.splice(i, 1)
    })
    updateQueue()
  }

  function setWinner(match: Match, winner: 'A' | 'B') {
    if (match.winner) return
    match.winner = winner

    const winners = winner === 'A' ? match.teamA : match.teamB
    const losers  = winner === 'A' ? match.teamB : match.teamA

    winners.forEach(p => {
      const player = playersList.find(x => x.id === p.id)
      if (player) player.wins++
      p.wins++
    })
    losers.forEach(p => {
      const player = playersList.find(x => x.id === p.id)
      if (player) player.losses++
      p.losses++
    })

    ;[...match.teamA, ...match.teamB].forEach(p => playerQueue.push(p))
    updateQueue()
  }

  function clearAll() {
    playersList.splice(0)
    playerQueue.splice(0)
    playerMatches.splice(0)
    nextPlayerId = 1
    nextMatchId = 1
    localStorage.clear()
  }

  return {
    playersList, playerQueue, playerMatches, queueFormat,
    teamSize, requiredPlayers,
    addPlayerToList, deletePlayerToList,
    addPlayerToQueue, deletePlayerToQueue,
    generateAutoMatch, setWinner,
    clearAll
  }
})
