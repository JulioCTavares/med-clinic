<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from '@/app/stores/auth.store'
import { useThemeStore } from '@/app/stores/theme.store'
import type { ThemeMode } from '@/app/stores/theme.store'

const $q = useQuasar()
const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()

const leftDrawerOpen = ref(false)

const navItems = [
  { label: 'Início', icon: 'home', to: '/dashboard' },
  { label: 'Consultas', icon: 'calendar_month', to: '/appointments' },
  { label: 'Planos de Saúde', icon: 'health_and_safety', to: '/health-plans' },
  { label: 'Meu Perfil', icon: 'person', to: '/profile' },
]

const themeOptions: { label: string; value: ThemeMode; icon: string }[] = [
  { label: 'Claro', value: 'light', icon: 'light_mode' },
  { label: 'Escuro', value: 'dark', icon: 'dark_mode' },
  { label: 'Sistema', value: 'system', icon: 'brightness_auto' },
]

async function handleLogout() {
  $q.dialog({
    title: 'Sair',
    message: 'Tem certeza que deseja sair da conta?',
    cancel: { label: 'Cancelar', flat: true },
    ok: { label: 'Sair', color: 'negative', flat: true },
  }).onOk(async () => {
    await authStore.logout()
    router.push('/auth/login')
  })
}
</script>

<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />
        <q-toolbar-title class="text-subtitle1 font-semibold">
          Med Clinic
        </q-toolbar-title>

        <!-- Theme toggle -->
        <q-btn-dropdown flat dense round icon="brightness_auto" aria-label="Tema">
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

        <!-- User avatar -->
        <q-btn flat round dense class="ml-1">
          <q-avatar color="white" text-color="primary" size="32px" font-size="14px">
            {{ authStore.patient?.name?.charAt(0).toUpperCase() ?? '?' }}
          </q-avatar>
          <q-menu>
            <q-list dense style="min-width: 160px">
              <q-item-label header class="text-caption">
                {{ authStore.patient?.name ?? authStore.user?.email }}
              </q-item-label>
              <q-separator />
              <q-item clickable v-close-popup to="/profile">
                <q-item-section avatar><q-icon name="person" /></q-item-section>
                <q-item-section>Meu perfil</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="handleLogout">
                <q-item-section avatar><q-icon name="logout" color="negative" /></q-item-section>
                <q-item-section class="text-negative">Sair</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      :width="220"
      class="bg-surface"
    >
      <q-list padding>
        <q-item-label header class="text-caption text-text-secondary uppercase tracking-widest">
          Navegação
        </q-item-label>
        <q-item
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          clickable
          v-ripple
          active-class="bg-blue-50 dark:bg-blue-900/20 text-primary font-medium rounded-lg"
          class="rounded-lg mb-0.5"
        >
          <q-item-section avatar>
            <q-icon :name="item.icon" />
          </q-item-section>
          <q-item-section>{{ item.label }}</q-item-section>
        </q-item>

        <q-separator class="my-2" />

        <q-item clickable v-ripple class="rounded-lg" @click="handleLogout">
          <q-item-section avatar>
            <q-icon name="logout" color="negative" />
          </q-item-section>
          <q-item-section class="text-negative">Sair</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>
