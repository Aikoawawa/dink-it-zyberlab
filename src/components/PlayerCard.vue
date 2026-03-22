<template>
  <q-item style="min-height: 80px;">
    <q-item-section>
      <q-item-label class="text-weight-bold" style="font-size: 15px;">{{ player.name }}</q-item-label>
      <q-item-label caption>lvl {{ player.level }} | Games : {{ player.gamesPlayed }} | W: {{ player.wins }} | L: {{ player.losses }}</q-item-label>
    </q-item-section>
    
    <q-item-section side>
      <div class="q-gutter-xs">
        <q-btn label="Delete" @click="emit('delete', player)" />
        <q-btn label="Add" @click="emit('add', player)"/>
        
      </div>
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">

interface Player {
  name: string;
  level: 1 | 2 |3
  wins: number
  losses: number
  gamesPlayed: number
}

interface Props {
  player : Player
}

defineProps<Props>()

const emit = defineEmits<{
  add: [player: Player]
  delete: [player: Player]
}>()
</script>