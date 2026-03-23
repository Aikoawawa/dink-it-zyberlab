<template>
  <q-list>
    <template v-if="players.length === 0">
      <div class="absolute-center text-grey">No Players</div>
    </template>

    <PlayerCard
      v-for="player in players"
      :key="player.name"
      :player="player"
      :visibleStats
      :visibleButtons
    />
  </q-list>

</template>

<script setup lang="ts">
  import PlayerCard from './PlayerCard.vue';
  import {Player, StatKey, ButtonKey} from '../types/Player'


  withDefaults(defineProps<{
    players: Player[],
    visibleStats: StatKey[]
    visibleButtons: ButtonKey[]
  }>(), {
    visibleStats: () => ['level', 'wins', 'losses', 'queuePosition', 'isQueued'],
    visibleButtons: () => ['addQueue', 'removeList']
  }
  )

</script>
