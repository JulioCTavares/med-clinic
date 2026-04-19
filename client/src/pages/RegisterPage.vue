<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/app/stores/auth.store'
import { mapApiError } from '@/shared/lib/error-mapper'
import AppTextField from '@/shared/ui/AppTextField.vue'
import AppButton from '@/shared/ui/AppButton.vue'
import AppErrorBanner from '@/shared/ui/AppErrorBanner.vue'

const router = useRouter()
const authStore = useAuthStore()

const name = ref('')
const email = ref('')
const password = ref('')
const birthDate = ref('')
const showPassword = ref(false)
const error = ref('')

const isValid = computed(
  () =>
    name.value.length >= 2 &&
    email.value.includes('@') &&
    password.value.length >= 8,
)

async function submit() {
  if (!isValid.value) return
  error.value = ''
  try {
    await authStore.register({
      name: name.value.trim(),
      email: email.value.trim(),
      password: password.value,
      birthDate: birthDate.value || undefined,
    })
    router.push('/dashboard')
  } catch (err) {
    error.value = mapApiError(err)
  }
}
</script>

<template>
  <q-card bordered class="rounded-xl">
    <q-card-section>
      <h2 class="text-h6 font-bold text-text-primary m-0">Criar conta</h2>
      <p class="text-body2 text-text-secondary mt-1 mb-4">Cadastre-se como paciente</p>

      <AppErrorBanner v-if="error" :message="error" class="mb-4" />

      <form class="flex flex-col gap-4" @submit.prevent="submit">
        <AppTextField
          v-model="name"
          label="Nome completo"
          icon="person"
          placeholder="Maria Silva"
          required
          autofocus
        />

        <AppTextField
          v-model="email"
          label="E-mail"
          type="email"
          icon="email"
          placeholder="seu@email.com"
          required
        />

        <AppTextField
          v-model="password"
          label="Senha"
          :type="showPassword ? 'text' : 'password'"
          icon="lock"
          :icon-right="showPassword ? 'visibility_off' : 'visibility'"
          hint="Mínimo 8 caracteres"
          required
        />

        <AppTextField
          v-model="birthDate"
          label="Data de nascimento (opcional)"
          type="date"
          icon="calendar_today"
        />

        <q-checkbox
          v-model="showPassword"
          label="Mostrar senha"
          dense
          class="text-body2 text-text-secondary"
        />

        <AppButton
          type="submit"
          label="Criar conta"
          color="primary"
          :loading="authStore.loading"
          :disabled="!isValid"
          class="w-full mt-2"
        />
      </form>
    </q-card-section>

    <q-separator />

    <q-card-section class="text-center py-3">
      <span class="text-body2 text-text-secondary">Já tem conta? </span>
      <router-link to="/auth/login" class="text-primary font-medium text-body2 no-underline hover:underline">
        Entrar
      </router-link>
    </q-card-section>
  </q-card>
</template>
