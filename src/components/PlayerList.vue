<template>
  <q-list bordered separator>
    <template v-if="players.length ==- 0">
      <div class="absolute-center text-grey">No players</div>
    </template>
    <PlayerCard 
      v-for="player in players" 
      :key="player.name" 
      :player="player"
      @add="emit('add', $event)"
      @delete="emit('delete', $event)"
    />
  </q-list>
</template>

<script setup lang="ts">
import PlayerCard from './PlayerCard.vue'

interface Player {
  name: string
  level: 1 | 2 | 3
  wins: number
  losses: number
}

defineProps<{
  players: Player[]
}>()

const emit = defineEmits<{
  add: [player: Player]
  delete: [player: Player]
}>()
</script>