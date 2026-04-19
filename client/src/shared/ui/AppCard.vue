<script setup lang="ts">
defineProps<{
  title?: string
  subtitle?: string
  flat?: boolean
  bordered?: boolean
  padding?: boolean
  clickable?: boolean
}>()

defineEmits<{ (e: 'click'): void }>()
</script>

<template>
  <q-card
    :flat="flat"
    :bordered="bordered ?? true"
    :class="['rounded-lg', clickable ? 'cursor-pointer hover:shadow-md transition-shadow' : '']"
    @click="clickable ? $emit('click') : undefined"
  >
    <q-card-section v-if="title || subtitle">
      <div v-if="title" class="text-subtitle1 font-semibold text-text-primary">{{ title }}</div>
      <div v-if="subtitle" class="text-caption text-text-secondary mt-0.5">{{ subtitle }}</div>
    </q-card-section>
    <q-card-section :class="padding === false ? 'q-pa-none' : ''">
      <slot />
    </q-card-section>
    <q-card-actions v-if="$slots.actions" align="right" class="q-px-md q-pb-md">
      <slot name="actions" />
    </q-card-actions>
  </q-card>
</template>
