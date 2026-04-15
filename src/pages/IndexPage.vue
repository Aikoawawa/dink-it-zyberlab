<template>
  <h1 class="text-h3">Dink It!</h1>

  <div class="row q-ma-md">

    <!-- PLAYERS -->
    <q-card style="width: 400px; height: 500px; margin: 10px;">
      <q-toolbar>
        <q-toolbar-title>Players</q-toolbar-title>
        <q-btn label="Add" @click="showAddPlayerDialog = true" />
      </q-toolbar>

      <q-separator />

      <q-scroll-area style="height: calc(100% - 60px);">
        <q-list>
          <q-item v-for="p in playersList" :key="p.id">
            <q-item-section>
              {{ p.name }} (Lv {{ p.level }}) | W: {{ p.wins }} L: {{ p.losses }}
            </q-item-section>

            <q-item-section side>
              <q-btn size="sm" label="Queue" @click="store.addPlayerToQueue(p)" />
              <q-btn size="sm" color="red" label="X" @click="store.deletePlayerToList(p)" />
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-card>

    <!-- QUEUE -->
    <q-card style="width: 400px; height: 500px; margin: 10px;">
      <q-toolbar>
        <q-toolbar-title>Queue</q-toolbar-title>
      </q-toolbar>

      <q-separator />

      <q-scroll-area style="height: calc(100% - 120px);">
        <q-list>
          <q-item v-for="(p, i) in playerQueue" :key="p.id">
            <q-item-section>
              #{{ i + 1 }} - {{ p.name }}
            </q-item-section>

            <q-item-section side>
              <q-btn size="sm" color="red" label="Remove" @click="store.deletePlayerToQueue(p)" />
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>

      <q-separator />

      <q-card-section>
        <q-btn
          label="Generate Match"
          class="full-width"
          :disable="playerQueue.length < requiredPlayers"
          @click="store.generateAutoMatch"
        />
      </q-card-section>
    </q-card>

    <!-- MATCHES -->
    <q-card style="width: 400px; height: 500px; margin: 10px;">
      <q-toolbar>
        <q-toolbar-title>Matches</q-toolbar-title>
      </q-toolbar>

      <q-separator />

      <q-scroll-area style="height: calc(100% - 60px);">
        <q-card
          v-for="match in playerMatches"
          :key="match.id"
          class="q-ma-sm q-pa-sm"
        >
          <div class="row justify-between">
            <div>Match #{{ match.id }}</div>
            <div>{{ match.format }}</div>
          </div>

          <q-separator class="q-my-xs" />

          <div class="row justify-between">

            <!-- TEAM A -->
            <div>
              <div><b>Team A</b></div>
              <div v-for="p in match.teamA" :key="p.id">{{ p.name }}</div>

              <q-btn
                v-if="!match.winner"
                size="sm"
                label="Win"
                @click="store.setWinner(match, 'A')"
              />
            </div>

            <div class="flex flex-center">VS</div>

            <!-- TEAM B -->
            <div class="text-right">
              <div><b>Team B</b></div>
              <div v-for="p in match.teamB" :key="p.id">{{ p.name }}</div>

              <q-btn
                v-if="!match.winner"
                size="sm"
                label="Win"
                @click="store.setWinner(match, 'B')"
              />
            </div>

          </div>

          <div v-if="match.winner" class="text-center text-green">
            Winner: Team {{ match.winner }}
          </div>
        </q-card>
      </q-scroll-area>
    </q-card>

  </div>

  <!-- ADD PLAYER -->
  <q-dialog v-model="showAddPlayerDialog">
    <q-card style="width: 300px;">
      <q-card-section>
        <q-input v-model="newPlayer.name" label="Name" />
        <q-select v-model="newPlayer.level" :options="[1,2,3]" label="Level" />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" v-close-popup />
        <q-btn label="Add" @click="addPlayerToList" />
      </q-card-actions>
    </q-card>
  </q-dialog>

</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { usePickleballStore } from '../stores/pickleball'
import { storeToRefs } from 'pinia'

const store = usePickleballStore()
const { playersList, playerQueue, playerMatches, requiredPlayers } = storeToRefs(store)

// Local UI state
const showAddPlayerDialog = ref(false)
const newPlayer = reactive({ name: '', level: 1 })

function addPlayerToList() {
  store.addPlayerToList(newPlayer.name, newPlayer.level)
  newPlayer.name = ''
  newPlayer.level = 1
  showAddPlayerDialog.value = false
}
</script>
