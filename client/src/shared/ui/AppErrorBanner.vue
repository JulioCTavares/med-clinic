<script setup lang="ts">
defineProps<{
  message: string
  retryLabel?: string
}>()

defineEmits<{ (e: 'retry'): void }>()
</script>

<template>
  <q-banner
    dense
    rounded
    class="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 mb-4"
    role="alert"
  >
    <template #avatar>
      <q-icon name="error_outline" color="negative" />
    </template>
    {{ message }}
    <template v-if="retryLabel" #action>
      <q-btn flat :label="retryLabel" color="negative" no-caps @click="$emit('retry')" />
    </template>
  </q-banner>
</template>
