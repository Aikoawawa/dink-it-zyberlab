<template>
  <h1>Hello!</h1>
  <div class="row q-ma-md">

    <!-- players tab -->
    <q-card style="width: 500px; height: 500px; margin: 20px;">
      <q-toolbar style="padding-top: 16px; padding-bottom: 16px">
        <q-toolbar-title>Players</q-toolbar-title>
        <q-btn label="Add Player" :ripple="false" @click="showAddPlayerDialog = true" />
      </q-toolbar>

      <q-separator />

        <q-scroll-area style="height: calc(100% - 68px);">
          <PlayerList :players="players"
          @add="addPlayerToQueue"
          @delete="deletePlayerToList"
          />
        </q-scroll-area>
    </q-card>

    <!-- queue tab -->
    <q-card class="q-ma-md" style="width: 500px; height: 650px; margin: 20px">
      <q-toolbar style="height: 68px;">
        <q-toolbar-title>Queue</q-toolbar-title>
      </q-toolbar>
      
      <q-separator />

        <PlayerList :players="queue"
          @add="addPlayerToQueue"
          @delete="deletePlayerToList"
        />
    </q-card>
  </div>



  <!-- dialog -->

<q-dialog v-model="showAddPlayerDialog">
  <q-card style="width: 500px;">
    <DialogHeader title="Add Player" />
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
</template>

<script setup lang="ts">
import DialogHeader from '../components/DialogHeader.vue'
import PlayerList from '../components/PlayerList.vue'
import {reactive, ref} from 'vue'


const showAddPlayerDialog = ref(false)

const newPlayer = reactive({
  name: '',
  level: 1 as 1 | 2 | 3,
})

interface Player {
  name: String
  level: 1 | 2 | 3
  wins: number
  losses: number
  queuePosition?: number
  isQueued?: boolean
}

const players: Player[] = reactive([])

const queue: Player[] = reactive([])


function addPlayerToList() {
  players.push({
    name: newPlayer.name,
    level: newPlayer.level,
    wins: 0,
    losses: 0,
    isQueued: false,
  })
  newPlayer.name = ''
  newPlayer.level = 1
  showAddPlayerDialog.value = false
}

function addPlayerToQueue(player: Player) {
  console.log('add', player)
  if (!player.isQueued) {
    player.isQueued = true
    queue.push(player)
    player.queuePosition = queue.length
    console.log(queue)
  } else {
    console.log("Player Already In queue")
  }
}

function deletePlayerToList(player: Player) {
  console.log('delete', player)
  const index = players.indexOf(player)
  if (index !== -1) {
    players.splice(index, 1)
  }
}

</script>