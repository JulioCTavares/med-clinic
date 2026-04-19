<script setup lang="ts">
defineProps<{
  count?: number
}>()
</script>

<template>
  <div class="flex flex-col gap-3">
    <q-card
      v-for="i in (count ?? 4)"
      :key="i"
      bordered
      flat
      class="rounded-lg"
    >
      <q-card-section class="flex gap-4">
        <q-skeleton type="circle" size="40px" class="shrink-0" />
        <div class="flex flex-col gap-2 flex-1">
          <q-skeleton type="text" width="60%" />
          <q-skeleton type="text" width="40%" />
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>
