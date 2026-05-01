import { defineStore } from 'pinia'
import { reactive, ref, computed, watch } from 'vue'
import axios from 'axios'

const apiClient = axios.create({
  baseURL: 'https://dink-it.zyberlab.com/Player',
  headers: {
    'Content-Type': 'application/json'
  }
})

type Player = {
  id: number
  serverId?: number
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

type PendingActionType = 'create' | 'update' | 'delete'

type PendingAction = {
  type: PendingActionType
  player: Player
}

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function save<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
}

function isOnline() {
  return typeof navigator !== 'undefined' ? navigator.onLine : true
}

async function createPlayerOnServer(player: Player) {
  if (!isOnline()) {
    return undefined
  }

  try {
    const response = await apiClient.post('', {
      name: player.name,
      level: player.level,
      wins: player.wins,
      losses: player.losses
    })

    return response.data?.id ?? response.data?.serverId
  } catch (error) {
    console.error('Failed to create player on server', error)
    return undefined
  }
}

async function savePlayerToServer(player: Player) {
  if (!isOnline()) {
    return undefined
  }

  if (!player.serverId) {
    return createPlayerOnServer(player)
  }

  try {
    await apiClient.put(`/${player.serverId}`, {
      name: player.name,
      level: player.level,
      wins: player.wins,
      losses: player.losses
    })

    return player.serverId
  } catch (error) {
    console.error('Failed to update player on server', error)
    return undefined
  }
}

async function deletePlayerFromServer(player: Player) {
  if (!isOnline() || !player.serverId) {
    return
  }

  try {
    await apiClient.delete(`/${player.serverId}`)
  } catch (error) {
    console.error('Failed to delete player on server', error)
  }
}

export const usePickleballStore = defineStore('pickleball', () => {
  // State — hydrated from localStorage
  const playersList = reactive<Player[]>(load('pkl_players', []))
  const playerQueue = reactive<Player[]>(load('pkl_queue', []))
  const playerMatches = reactive<Match[]>(load('pkl_matches', []))
  const queueFormat = ref<'singles' | 'doubles'>(load('pkl_format', 'doubles'))
  const pendingSync = reactive<PendingAction[]>(load('pkl_pending_sync', []))

  let nextPlayerId = load<number>('pkl_next_player_id', 1)
  let nextMatchId = load<number>('pkl_next_match_id', 1)

  // Computed
  const teamSize = computed(() => queueFormat.value === 'singles' ? 1 : 2)
  const requiredPlayers = computed(() => queueFormat.value === 'singles' ? 2 : 4)

  // Persist on change
  watch(playersList, (v) => save('pkl_players', v), { deep: true })
  watch(playerQueue, (v) => save('pkl_queue', v), { deep: true })
  watch(playerMatches, (v) => save('pkl_matches', v), { deep: true })
  watch(queueFormat, (v) => save('pkl_format', v))
  watch(pendingSync, (v) => save('pkl_pending_sync', v), { deep: true })

  async function enqueueServerAction(action: PendingAction) {
    pendingSync.push(action)
    if (isOnline()) {
      await syncPendingQueue()
    }
  }

  async function syncPendingQueue() {
    if (!isOnline() || pendingSync.length === 0) {
      return
    }

    while (pendingSync.length > 0) {
      const action = pendingSync[0]!
      try {
        if (action.type === 'create') {
          const serverId = await createPlayerOnServer(action.player)
          if (serverId) {
            const localPlayer = playersList.find(p => p.id === action.player.id)
            if (localPlayer) {
              localPlayer.serverId = serverId
            }
          }
        } else if (action.type === 'update') {
          await savePlayerToServer(action.player)
        } else if (action.type === 'delete') {
          await deletePlayerFromServer(action.player)
        }

        pendingSync.shift()
      } catch (error) {
        console.error('Sync queue error', error)
        break
      }
    }
  }

  function mergeServerPlayer(serverPlayer: Player) {
    const local = playersList.find(
      p => p.serverId === serverPlayer.serverId || (p.name === serverPlayer.name && p.level === serverPlayer.level)
    )

    if (local) {
      if (!local.serverId && serverPlayer.serverId !== undefined) {
        local.serverId = serverPlayer.serverId
      }
      if (local.wins === 0 && serverPlayer.wins > 0) {
        local.wins = serverPlayer.wins
      }
      if (local.losses === 0 && serverPlayer.losses > 0) {
        local.losses = serverPlayer.losses
      }
    } else {
      playersList.push({
        id: nextPlayerId++,
        ...(serverPlayer.serverId !== undefined ? { serverId: serverPlayer.serverId } : {}),
        name: serverPlayer.name,
        level: serverPlayer.level,
        wins: serverPlayer.wins,
        losses: serverPlayer.losses
      })
    }
  }

  async function loadPlayersFromServer() {
    if (!isOnline()) {
      return
    }

    try {
      const response = await apiClient.get<any[]>('')
      const serverPlayers = response.data ?? []

      serverPlayers.forEach((item) => {
        mergeServerPlayer({
          id: 0,
          serverId: item.id ?? item.serverId,
          name: item.name,
          level: item.level,
          wins: item.wins ?? 0,
          losses: item.losses ?? 0
        })
      })

      await syncPendingQueue()
    } catch (error) {
      console.error('Failed to load players from server', error)
    }
  }

  // Actions
  async function addPlayerToList(name: string, level: number) {
    if (!name) return

    const player: Player = {
      id: nextPlayerId++,
      name,
      level,
      wins: 0,
      losses: 0
    }

    playersList.push(player)
    save('pkl_next_player_id', nextPlayerId)
    await enqueueServerAction({ type: 'create', player })
  }

  async function deletePlayerToList(p: Player) {
    const i = playersList.indexOf(p)
    if (i !== -1) {
      playersList.splice(i, 1)
      await enqueueServerAction({ type: 'delete', player: p })
    }
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
    save('pkl_next_match_id', nextMatchId)

    selected.forEach(p => {
      const i = playerQueue.findIndex(x => x.id === p.id)
      if (i !== -1) playerQueue.splice(i, 1)
    })
    updateQueue()
  }

  async function setWinner(match: Match, winner: 'A' | 'B') {
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

    await Promise.all(
      [...winners, ...losers].map(player => enqueueServerAction({ type: 'update', player }))
    )
  }

  function clearAll() {
    playersList.splice(0)
    playerQueue.splice(0)
    playerMatches.splice(0)
    pendingSync.splice(0)
    nextPlayerId = 1
    nextMatchId = 1
    save('pkl_next_player_id', nextPlayerId)
    save('pkl_next_match_id', nextMatchId)
    save('pkl_players', playersList)
    save('pkl_queue', playerQueue)
    save('pkl_matches', playerMatches)
    save('pkl_pending_sync', pendingSync)
  }

  async function initializeSync() {
    if (isOnline()) {
      await syncPendingQueue()
      await loadPlayersFromServer()
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('online', async () => {
        await syncPendingQueue()
        await loadPlayersFromServer()
      })
    }
  }

  return {
    playersList, playerQueue, playerMatches, queueFormat,
    teamSize, requiredPlayers,
    addPlayerToList, deletePlayerToList,
    addPlayerToQueue, deletePlayerToQueue,
    generateAutoMatch, setWinner,
    initializeSync, loadPlayersFromServer,
    clearAll
  }
})
