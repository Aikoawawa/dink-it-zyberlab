<template>
  <q-list bordered separator>
    <template v-if="players.length === 0">
      <div class="absolute-center text-grey">No players</div>
    </template>
    <PlayerCard
      v-for="player in players"
      :key="player.name"
      :player="player"
      :visibleStats
      :visibleButtons="['addQueue', 'removeList']"
      :is-in-queue="isInQueue"
      @add="emit('add', $event)"
      @delete="emit('delete', $event)"
    />
  </q-list>
</template>

<script setup lang="ts">
import PlayerCard from './PlayerCard.vue'
import {Player, StatKey} from '../types/Player'

withDefaults(defineProps<{
  players: Player[]
  visibleStats: StatKey[]
  isInQueue: (id: number) => boolean
}>(),{
  visibleStats: () => ['level', 'wins', 'losses', 'queuePosition', 'isQueued', 'id']
})


const emit = defineEmits<{
  add: [player: Player]
  delete: [player: Player]
}>()
</script>
