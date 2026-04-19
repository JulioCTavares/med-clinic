<script setup lang="ts">
defineProps<{
  modelValue: unknown
  options: unknown[]
  label?: string
  hint?: string
  error?: string
  optionLabel?: string
  optionValue?: string
  emitValue?: boolean
  mapOptions?: boolean
  clearable?: boolean
  loading?: boolean
  placeholder?: string
}>()

defineEmits<{ (e: 'update:modelValue', value: unknown): void }>()
</script>

<template>
  <q-select
    :model-value="modelValue"
    :options="options"
    :label="label"
    :hint="hint"
    :error="!!error"
    :error-message="error"
    :option-label="optionLabel ?? 'label'"
    :option-value="optionValue ?? 'value'"
    :emit-value="emitValue ?? true"
    :map-options="mapOptions ?? true"
    :clearable="clearable"
    :loading="loading"
    outlined
    dense
    class="w-full"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>
