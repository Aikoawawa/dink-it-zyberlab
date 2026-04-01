<template>
  <h1 class="text-h3">Meow</h1>
  <div class="row q-ma-md">

    <!-- players tab -->
    <q-card style="width: 450px; height: 500px; margin: 20px;">
      <q-toolbar style="padding-top: 16px; padding-bottom: 16px">
        <q-toolbar-title>Players</q-toolbar-title>
        <q-btn label="Add Player" :ripple="false" @click="showAddPlayerDialog = true" />
      </q-toolbar>

      <q-separator />

        <q-scroll-area style="height: calc(100% - 68px);">
          <PlayerList  
          :players="playersList"
          :is-in-queue="isInQueue"
          @add="addPlayerToQueue"
          @delete="deletePlayerToList"
          :visible-stats="['level','wins','losses']"
          />
        </q-scroll-area>
    </q-card>

    <!-- queue tab (! Need to make its own template) [finished] -->
    <q-card style="width: 450px; height: 500px; margin: 20px;">
      <q-toolbar style="padding-top: 16px; padding-bottom: 16px">
        <q-toolbar-title>Queue</q-toolbar-title>
      </q-toolbar>

      <q-separator />

      <q-scroll-area style="height: calc(100% - 150px);">
        <QueueList
          :players="playerQueue"
          :is-in-queue="isInQueue"
          @delete="deletePlayerToQueue"
          :visibleStats="['level', 'wins', 'losses', 'queuePosition']"
          :visibleButtons="['removeList']"
        />
      </q-scroll-area>

      <q-separator />


      <!--generate Match button -->
      <q-card-section>
        <q-toolbar>
            <q-btn label="Generate Matches"
              class="absolute-center"
              style="width: 300px;"
              @click="showGenerateMatchDialog = true"/>
        </q-toolbar>
      </q-card-section>

    </q-card>


    <!--Matches tab-->
    <q-card style="width: 450px; height: 500px; margin: 20px" >
      <q-toolbar style="padding-top: 16px; padding-bottom: 16px;">
        <q-toolbar-title>Matches</q-toolbar-title>
      </q-toolbar>
    </q-card>
  </div>



  <!-- dialog -->

  <q-dialog v-model="showAddPlayerDialog">
    <q-card style="width: 500px;">
      <q-card-section>
        <q-toolbar>
          <q-toolbar-title>Add Player</q-toolbar-title>
        </q-toolbar>

        <q-separator/>
      </q-card-section>
      <q-card-section class="q-gutter-md">
        <q-input v-model="newPlayer.name" label="Name" />
        <q-select
          v-model="newPlayer.level"
          :options="[1, 2, 3]"
          label="Level"
        />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn label="Cancel" v-close-popup />
        <q-btn label="Add" @click="addPlayerToList" />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-dialog v-model="showGenerateMatchDialog">
    <q-card style="width: 500px;">
      <q-card-section>
        <q-toolbar>
          <q-toolbar-title>Generate Match</q-toolbar-title>
          <q-btn icon="close" flat rounded @click="showGenerateMatchDialog = false"></q-btn>

        </q-toolbar>
        <q-separator />
      </q-card-section>
      <q-card-section>

      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import DialogHeader from '../components/DialogHeader.vue'
import PlayerList from '../components/PlayerList.vue'
import QueueList from '../components/QueueList.vue'
import {reactive, ref} from 'vue'
import {Player, StatKey, Match} from '../types/Player'
import { matCheckBoxOutlineBlank } from '@quasar/extras/material-icons'


const showAddPlayerDialog = ref(false)
const showGenerateMatchDialog = ref(false)


const playersList: Player[] = reactive([])
const playerQueue: Player[] = reactive([])
const playerMatches: Match[] = reactive([])
const selectedPlayers: Player[] = reactive([])

let nextPlayerId = 1
let nextMatchId = 1


//PLAYER LIST
const newPlayer = reactive({
  name: '',
  level: 1 as 1 | 2 | 3,
})

function addPlayerToList() {
  playersList.push({
    id: nextPlayerId++,
    name: newPlayer.name,
    level: newPlayer.level,
    wins: 0,
    losses: 0,
    isQueued: false,
    isPlaying: false
    
  })
  newPlayer.name = ''
  newPlayer.level = 1
  showAddPlayerDialog.value = false
}

function deletePlayerToList(player: Player) {
  console.log('delete', player)
  const index = playersList.indexOf(player)
  if (index !== -1) {
    playersList.splice(index, 1)
  }
}

//PLAYER QUEUE
const isInQueue = (playerId: number) => {
  return playerQueue.some(player => player.id === playerId)
}


function addPlayerToQueue(player: Player) {
  const index = playersList.indexOf(player)
  const queuePos = playerQueue.length

  player.queuePosition = queuePos
  //playersList.splice(index, 1)
  playerQueue.push(player)


}

function deletePlayerToQueue(player: Player){
   console.log('delete', player)
  const index = playerQueue.indexOf(player)
  if (index !== -1) {
    playerQueue.splice(index, 1)
  }
}

//PLAYER MATCH
const matchBuilder = reactive<{
  isOpen: boolean,
  teamA: Player[],
  teamB: Player[],
}>({
  isOpen: false,
  teamA:  [],
  teamB:  [],
})

const isInMatch = (playerId: number) => {
  return (
    matchBuilder.teamA.some(player => player.id === playerId)||
    matchBuilder.teamB.some(player => player.id === playerId)
  )
}

function startMatch(){
  matchBuilder.isOpen = true
  matchBuilder.teamA.splice(0, matchBuilder.teamA.length)
  matchBuilder.teamB.splice(0, matchBuilder.teamB.length)
}

function cancelMatch(){
  matchBuilder.teamA.splice(0, matchBuilder.teamA.length)
  matchBuilder.teamB.splice(0, matchBuilder.teamB.length)
  matchBuilder.isOpen = false
}

function addPlayerToTeam(player: Player, team: 'A'|'B'){
  if (isInMatch(player.id)) return 

  if (team === 'A' && matchBuilder.teamA.length < 2){
    matchBuilder.teamA.push(player)
  }
  if (team === 'B' && matchBuilder.teamB.length < 2){
    matchBuilder.teamB.push(player)
  }
}

function removePlayerFromTeam(player: Player, team: 'A'|'B') {
  if (team === 'A'){
    const index = matchBuilder.teamA.findIndex(p => p.id === player.id)
    if (index !== -1) matchBuilder.teamA.splice(index, 1)
  }

  if (team === 'B'){
    const index = matchBuilder.teamB.findIndex(p => p.id === player.id)
    if (index !== -1) matchBuilder.teamB.splice(index, 1)
  }
}

function confirmMatch(){
  if (matchBuilder.teamA.length !== 2 || matchBuilder.teamB.length !== 2) return

  playerMatches.push({
    id: nextMatchId++,
    teamA: [...matchBuilder.teamA],
    teamB: [...matchBuilder.teamB]
  })

  const matchedPlayers = [...matchBuilder.teamA, ...matchBuilder.teamB]

  matchedPlayers.forEach(player =>{
    const index = playerQueue.findIndex(p => p.id === player.id)
    if (index !== -1){
      playerQueue.splice(index, 1)
    }
  })
  cancelMatch()
}




</script>
