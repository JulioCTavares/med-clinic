<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
  backRoute?: string
}>()
</script>

<template>
  <div class="flex items-center gap-3 mb-6">
    <q-btn
      v-if="backRoute"
      :to="backRoute"
      icon="arrow_back"
      flat
      round
      dense
      color="primary"
      aria-label="Voltar"
    />
    <div>
      <h1 class="text-h5 font-bold text-text-primary m-0 leading-tight">{{ title }}</h1>
      <p v-if="subtitle" class="text-body2 text-text-secondary m-0 mt-0.5">{{ subtitle }}</p>
    </div>
    <div v-if="$slots.actions" class="ml-auto flex gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>
