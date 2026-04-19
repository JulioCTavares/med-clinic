<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/app/stores/auth.store'
import { mapApiError } from '@/shared/lib/error-mapper'
import AppTextField from '@/shared/ui/AppTextField.vue'
import AppButton from '@/shared/ui/AppButton.vue'
import AppErrorBanner from '@/shared/ui/AppErrorBanner.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const error = ref('')

const isValid = computed(() => email.value.includes('@') && password.value.length >= 1)

async function submit() {
  if (!isValid.value) return
  error.value = ''
  try {
    await authStore.login({ email: email.value, password: password.value })
    const redirect = (route.query.redirect as string) ?? '/dashboard'
    router.push(redirect)
  } catch (err) {
    error.value = mapApiError(err)
  }
}
</script>

<template>
  <q-card bordered class="rounded-xl">
    <q-card-section>
      <h2 class="text-h6 font-bold text-text-primary m-0">Entrar</h2>
      <p class="text-body2 text-text-secondary mt-1 mb-4">Acesse sua conta de paciente</p>

      <AppErrorBanner v-if="error" :message="error" class="mb-4" />

      <form class="flex flex-col gap-4" @submit.prevent="submit">
        <AppTextField
          v-model="email"
          label="E-mail"
          type="email"
          icon="email"
          placeholder="seu@email.com"
          required
          autofocus
        />

        <AppTextField
          v-model="password"
          label="Senha"
          :type="showPassword ? 'text' : 'password'"
          icon="lock"
          :icon-right="showPassword ? 'visibility_off' : 'visibility'"
          required
        />

        <q-checkbox
          v-model="showPassword"
          label="Mostrar senha"
          dense
          class="text-body2 text-text-secondary"
        />

        <AppButton
          type="submit"
          label="Entrar"
          color="primary"
          :loading="authStore.loading"
          :disabled="!isValid"
          class="w-full mt-2"
        />
      </form>
    </q-card-section>

    <q-separator />

    <q-card-section class="text-center py-3">
      <span class="text-body2 text-text-secondary">Não tem conta? </span>
      <router-link to="/auth/register" class="text-primary font-medium text-body2 no-underline hover:underline">
        Criar conta
      </router-link>
    </q-card-section>
  </q-card>
</template>
