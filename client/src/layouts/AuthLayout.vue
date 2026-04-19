<script setup lang="ts">
import { useThemeStore } from '@/app/stores/theme.store'
import type { ThemeMode } from '@/app/stores/theme.store'

const themeStore = useThemeStore()

const themeOptions: { label: string; value: ThemeMode; icon: string }[] = [
  { label: 'Claro', value: 'light', icon: 'light_mode' },
  { label: 'Escuro', value: 'dark', icon: 'dark_mode' },
  { label: 'Sistema', value: 'system', icon: 'brightness_auto' },
]
</script>

<template>
  <q-layout view="hHh lpR fFf">
    <q-page-container>
      <q-page class="flex items-center justify-center min-h-screen bg-surface-alt">
        <!-- Theme toggle top-right -->
        <div class="absolute top-4 right-4">
          <q-btn-dropdown flat dense round icon="brightness_auto" color="primary" aria-label="Tema">
            <q-list dense>
              <q-item
                v-for="opt in themeOptions"
                :key="opt.value"
                clickable
                v-close-popup
                :active="themeStore.mode === opt.value"
                @click="themeStore.setMode(opt.value)"
              >
                <q-item-section avatar>
                  <q-icon :name="opt.icon" />
                </q-item-section>
                <q-item-section>{{ opt.label }}</q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </div>

        <div class="w-full max-w-sm px-4">
          <!-- Logo / Brand -->
          <div class="text-center mb-8">
            <q-icon name="local_hospital" size="48px" color="primary" />
            <h1 class="text-h5 font-bold text-text-primary mt-2 mb-0">Med Clinic</h1>
            <p class="text-body2 text-text-secondary mt-1">Cuidando de você</p>
          </div>

          <router-view />
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>
