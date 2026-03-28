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
          <PlayerList :players="playersList"
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
          :visibleStats="['level', 'wins', 'losses', 'queuePosition']"
          :visibleButtons="[]"
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
import {Player, StatKey } from '../types/Player'


const showAddPlayerDialog = ref(false)
const showGenerateMatchDialog = ref(false)

const newPlayer = reactive({
  name: '',
  level: 1 as 1 | 2 | 3,
})

const playersList: Player[] = reactive([])
const playerQueue: Player[] = reactive([])
const playerMatches: Player[] = reactive([])


function addPlayerToList() {
  playersList.push({
    name: newPlayer.name,
    level: newPlayer.level,
    wins: 0,
    losses: 0,
    isQueued: false,
    isPlaying: false,
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

function addPlayerToQueue(player: Player) {
  const index = playersList.indexOf(player)
  const queuePos = playerQueue.length

  player.queuePosition = queuePos
  playersList.splice(index, 1)
  playerQueue.push(player)
}

</script>
