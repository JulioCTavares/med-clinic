<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { appointmentsApi } from '@/features/appointments/api'
import { mapApiError } from '@/shared/lib/error-mapper'
import type { Appointment } from '@/entities/appointment'
import AppPageHeader from '@/shared/ui/AppPageHeader.vue'
import AppCard from '@/shared/ui/AppCard.vue'
import AppErrorBanner from '@/shared/ui/AppErrorBanner.vue'

const route = useRoute()
const appointment = ref<Appointment | null>(null)
const loading = ref(true)
const error = ref('')

const statusMap: Record<string, { label: string; color: string; icon: string }> = {
  pending: { label: 'Pendente', color: 'warning', icon: 'pending' },
  confirmed: { label: 'Confirmada', color: 'positive', icon: 'event_available' },
  completed: { label: 'Realizada', color: 'info', icon: 'check_circle' },
  cancelled: { label: 'Cancelada', color: 'negative', icon: 'cancel' },
}

function formatDate(date: string) {
  return new Date(date + 'T00:00:00').toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    appointment.value = await appointmentsApi.getById(route.params.id as string)
  } catch (err) {
    error.value = mapApiError(err)
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <q-page class="q-pa-md max-w-2xl mx-auto">
    <AppPageHeader title="Detalhes da Consulta" back-route="/appointments" />

    <AppErrorBanner v-if="error" :message="error" retry-label="Tentar novamente" @retry="load" />

    <div v-if="loading" class="flex flex-col gap-4">
      <q-skeleton height="120px" class="rounded-lg" />
      <q-skeleton height="80px" class="rounded-lg" />
    </div>

    <div v-else-if="appointment" class="flex flex-col gap-4">
      <!-- Status banner -->
      <div
        :class="`flex items-center gap-3 p-4 rounded-xl bg-${statusMap[appointment.status]?.color ?? 'grey'}/10`"
      >
        <q-icon
          :name="statusMap[appointment.status]?.icon ?? 'event'"
          :color="statusMap[appointment.status]?.color ?? 'grey'"
          size="32px"
        />
        <div>
          <p class="text-subtitle2 font-semibold m-0">
            {{ statusMap[appointment.status]?.label ?? appointment.status }}
          </p>
          <p class="text-caption text-text-secondary m-0">
            {{ formatDate(appointment.date) }} às {{ appointment.time.slice(0, 5) }}
          </p>
        </div>
      </div>

      <!-- Doctor info -->
      <AppCard title="Médico">
        <div class="flex gap-3 items-center">
          <q-avatar color="primary" text-color="white" size="48px">
            <q-icon name="person" size="28px" />
          </q-avatar>
          <div>
            <p class="text-body2 font-semibold text-text-primary m-0">
              {{ appointment.doctor?.name ?? '—' }}
            </p>
            <p class="text-caption text-text-secondary m-0">{{ appointment.doctor?.crm ?? '' }}</p>
          </div>
        </div>
      </AppCard>

      <!-- Details -->
      <AppCard title="Informações">
        <div class="flex flex-col gap-2">
          <div class="flex justify-between text-body2">
            <span class="text-text-secondary">Código</span>
            <span class="font-medium text-text-primary">{{ appointment.code }}</span>
          </div>
          <q-separator />
          <div class="flex justify-between text-body2">
            <span class="text-text-secondary">Data</span>
            <span class="font-medium text-text-primary">{{ formatDate(appointment.date) }}</span>
          </div>
          <q-separator />
          <div class="flex justify-between text-body2">
            <span class="text-text-secondary">Horário</span>
            <span class="font-medium text-text-primary">{{ appointment.time.slice(0, 5) }}</span>
          </div>
          <q-separator />
          <div class="flex justify-between text-body2">
            <span class="text-text-secondary">Tipo</span>
            <span class="font-medium text-text-primary">
              {{ appointment.isPrivate ? 'Particular' : 'Convênio' }}
            </span>
          </div>
        </div>
      </AppCard>

      <!-- Procedures -->
      <AppCard v-if="appointment.procedures?.length" title="Procedimentos">
        <div class="flex flex-col gap-1">
          <div
            v-for="proc in appointment.procedures"
            :key="proc.id"
            class="flex items-center gap-2 text-body2 text-text-primary py-1"
          >
            <q-icon name="medical_services" size="16px" color="primary" />
            {{ proc.name }}
          </div>
        </div>
      </AppCard>
    </div>
  </q-page>
</template>
