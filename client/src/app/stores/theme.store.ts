import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Dark } from 'quasar'

export type ThemeMode = 'light' | 'dark' | 'system'

export const useThemeStore = defineStore('theme', () => {
  const mode = ref<ThemeMode>((localStorage.getItem('theme') as ThemeMode) ?? 'system')

  function _applyMode(m: ThemeMode) {
    if (m === 'system') {
      Dark.set('auto')
    } else {
      Dark.set(m === 'dark')
    }
    const isDark = m === 'dark' || (m === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    document.body.classList.toggle('dark', isDark)
  }

  function setMode(m: ThemeMode) {
    mode.value = m
    localStorage.setItem('theme', m)
    _applyMode(m)
  }

  function init() {
    _applyMode(mode.value)
    if (mode.value === 'system') {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        _applyMode('system')
      })
    }
  }

  return { mode, setMode, init }
})
