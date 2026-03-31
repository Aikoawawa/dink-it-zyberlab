<template>
  <q-item style="min-height: 80px;">
    <q-item-section>
      <q-item-label class="text-weight-bold" style="font-size: 15px;">{{ player.name }}</q-item-label>
      <q-item-label caption>
          <span v-if="visibleStats.includes('level')">lvl {{ player.level }}</span>
          <span v-if="visibleStats.includes('wins')"> | W: {{ player.wins }}</span>
          <span v-if="visibleStats.includes('losses')"> | L: {{ player.losses }}</span>
          <span v-if="visibleStats.includes('queuePosition')"> | Queue: {{ player.queuePosition }}</span>
          <span v-if="visibleStats.includes('isQueued')"> | Queued: {{ player.isQueued }}</span>
          <span v-if="visibleStats.includes('id')"> | ID: {{ player.id }}</span>
      </q-item-label>
    </q-item-section>

    <q-item-section side>
      <div class="q-gutter-xs">
        <q-btn 
        v-if="visibleButtons?.includes('removeList')" 
        label="Delete" 
        @click="emit('delete', player)" 
        />

        <q-btn v-if="visibleButtons?.includes('addQueue')" 
        label="Add" 
        :disable="isInQueue ? isInQueue(player.id) : false" 
        @click="emit('add', player)"
        />
      </div>
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
  import {Player, StatKey, ButtonKey} from '../types/Player'

  interface Props {
    player : Player
    visibleStats: StatKey[]
    visibleButtons?: ButtonKey[]
    isInQueue?:(id:number) => boolean
  }

  withDefaults(defineProps<Props>(), {
    visibleButtons: () => []
  })

  const emit = defineEmits<{
    add: [player: Player]
    delete: [player: Player]
  }>()
</script>
