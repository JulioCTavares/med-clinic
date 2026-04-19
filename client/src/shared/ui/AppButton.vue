<script setup lang="ts">
defineProps<{
  label?: string
  loading?: boolean
  disabled?: boolean
  color?: string
  outline?: boolean
  flat?: boolean
  icon?: string
  type?: 'button' | 'submit' | 'reset'
  size?: 'sm' | 'md' | 'lg'
}>()

defineEmits<{ (e: 'click', evt: MouseEvent): void }>()
</script>

<template>
  <q-btn
    :label="label"
    :loading="loading"
    :disabled="disabled || loading"
    :color="color ?? 'primary'"
    :outline="outline"
    :flat="flat"
    :icon="icon"
    :type="type ?? 'button'"
    :size="size ?? 'md'"
    no-caps
    rounded
    class="font-medium"
    @click="$emit('click', $event)"
  >
    <slot />
  </q-btn>
</template>
