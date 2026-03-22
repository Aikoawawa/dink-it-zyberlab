<template>
  <q-card-section>
    <q-toolbar>
      <q-toolbar-title>{{ title }}</q-toolbar-title>
    </q-toolbar>
    <q-separator />
  </q-card-section>
</template>

<script setup lang="ts">

interface Props {
  title: string;
}

defineProps<Props>();
</script>