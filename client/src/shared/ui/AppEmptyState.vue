<script setup lang="ts">
defineProps<{
  icon?: string
  title?: string
  description?: string
  actionLabel?: string
}>()

defineEmits<{ (e: 'action'): void }>()
</script>

<template>
  <div class="flex flex-col items-center justify-center py-16 px-4 text-center">
    <q-icon
      :name="icon ?? 'inbox'"
      size="64px"
      class="text-text-secondary mb-4 opacity-40"
    />
    <p class="text-subtitle1 font-medium text-text-primary mb-1">
      {{ title ?? 'Nenhum resultado encontrado' }}
    </p>
    <p v-if="description" class="text-body2 text-text-secondary mb-4 max-w-sm">
      {{ description }}
    </p>
    <q-btn
      v-if="actionLabel"
      :label="actionLabel"
      color="primary"
      no-caps
      rounded
      @click="$emit('action')"
    />
  </div>
</template>
