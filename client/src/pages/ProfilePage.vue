<script setup lang="ts">
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useAuthStore } from '@/app/stores/auth.store'
import { profileApi } from '@/features/profile/api'
import { mapApiError } from '@/shared/lib/error-mapper'
import AppPageHeader from '@/shared/ui/AppPageHeader.vue'
import AppCard from '@/shared/ui/AppCard.vue'
import AppTextField from '@/shared/ui/AppTextField.vue'
import AppButton from '@/shared/ui/AppButton.vue'
import AppErrorBanner from '@/shared/ui/AppErrorBanner.vue'

const $q = useQuasar()
const authStore = useAuthStore()

const editing = ref(false)
const saving = ref(false)
const error = ref('')

const name = ref(authStore.patient?.name ?? '')
const birthDate = ref(authStore.patient?.birthDate ?? '')
const phonesRaw = ref((authStore.patient?.phones ?? []).join(', '))

const avatarLetter = computed(() => authStore.patient?.name?.charAt(0).toUpperCase() ?? '?')

function startEdit() {
  name.value = authStore.patient?.name ?? ''
  birthDate.value = authStore.patient?.birthDate ?? ''
  phonesRaw.value = (authStore.patient?.phones ?? []).join(', ')
  editing.value = true
  error.value = ''
}

function cancelEdit() {
  editing.value = false
  error.value = ''
}

async function save() {
  if (!authStore.patientId) return
  saving.value = true
  error.value = ''
  try {
    const phones = phonesRaw.value
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean)

    const updated = await profileApi.update(authStore.patientId, {
      name: name.value.trim() || undefined,
      birthDate: birthDate.value || undefined,
      phones: phones.length ? phones : undefined,
    })

    authStore.patient = updated
    editing.value = false
    $q.notify({ type: 'positive', message: 'Perfil atualizado com sucesso!' })
  } catch (err) {
    error.value = mapApiError(err)
  } finally {
    saving.value = false
  }
}

function formatDate(date?: string) {
  if (!date) return '—'
  return new Date(date + 'T00:00:00').toLocaleDateString('pt-BR')
}
</script>

<template>
  <q-page class="q-pa-md max-w-2xl mx-auto">
    <AppPageHeader title="Meu Perfil" />

    <!-- Avatar section -->
    <div class="flex flex-col items-center mb-6">
      <q-avatar color="primary" text-color="white" size="80px" class="text-h4 mb-3">
        {{ avatarLetter }}
      </q-avatar>
      <h2 class="text-subtitle1 font-semibold text-text-primary m-0">
        {{ authStore.patient?.name ?? 'Paciente' }}
      </h2>
      <p class="text-caption text-text-secondary m-0">{{ authStore.user?.email }}</p>
    </div>

    <AppErrorBanner v-if="error" :message="error" />

    <!-- View mode -->
    <AppCard v-if="!editing" title="Dados pessoais">
      <div class="flex flex-col gap-3">
        <div class="flex justify-between text-body2">
          <span class="text-text-secondary">Nome</span>
          <span class="font-medium text-text-primary">{{ authStore.patient?.name ?? '—' }}</span>
        </div>
        <q-separator />
        <div class="flex justify-between text-body2">
          <span class="text-text-secondary">Data de nascimento</span>
          <span class="font-medium text-text-primary">{{ formatDate(authStore.patient?.birthDate) }}</span>
        </div>
        <q-separator />
        <div class="flex justify-between text-body2">
          <span class="text-text-secondary">Telefones</span>
          <span class="font-medium text-text-primary text-right">
            {{ authStore.patient?.phones?.join(', ') || '—' }}
          </span>
        </div>
      </div>

      <template #actions>
        <AppButton label="Editar" icon="edit" color="primary" outline @click="startEdit" />
      </template>
    </AppCard>

    <!-- Edit mode -->
    <AppCard v-else title="Editar dados">
      <form class="flex flex-col gap-4" @submit.prevent="save">
        <AppTextField v-model="name" label="Nome completo" icon="person" required autofocus />
        <AppTextField v-model="birthDate" label="Data de nascimento" type="date" icon="calendar_today" />
        <AppTextField
          v-model="phonesRaw"
          label="Telefones (separados por vírgula)"
          icon="phone"
          hint="Ex: (11) 91234-5678, (11) 3456-7890"
        />
      </form>

      <template #actions>
        <AppButton label="Cancelar" flat color="grey" @click="cancelEdit" />
        <AppButton label="Salvar" color="primary" :loading="saving" @click="save" />
      </template>
    </AppCard>
  </q-page>
</template>
