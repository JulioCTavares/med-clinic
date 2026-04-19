<script setup lang="ts">
defineProps<{
  modelValue: string
  label?: string
  hint?: string
  error?: string
  type?: string
  placeholder?: string
  required?: boolean
  autofocus?: boolean
  readonly?: boolean
  icon?: string
  iconRight?: string
  clearable?: boolean
  min?: string
  max?: string
}>()

defineEmits<{ (e: 'update:modelValue', value: string): void }>()
</script>

<template>
  <q-input
    :model-value="modelValue"
    :label="label"
    :hint="hint"
    :error="!!error"
    :error-message="error"
    :type="type ?? 'text'"
    :placeholder="placeholder"
    :required="required"
    :autofocus="autofocus"
    :readonly="readonly"
    :prepend-inner-icon="icon"
    :append-inner-icon="iconRight"
    :clearable="clearable"
    :min="min"
    :max="max"
    outlined
    dense
    class="w-full"
    @update:model-value="$emit('update:modelValue', $event as string)"
  />
</template>
