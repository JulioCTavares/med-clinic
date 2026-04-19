<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/app/stores/auth.store'
import { appointmentsApi } from '@/features/appointments/api'
import { mapApiError } from '@/shared/lib/error-mapper'
import type { Appointment } from '@/entities/appointment'
import AppPageHeader from '@/shared/ui/AppPageHeader.vue'
import AppButton from '@/shared/ui/AppButton.vue'
import AppErrorBanner from '@/shared/ui/AppErrorBanner.vue'
import AppSkeletonList from '@/shared/ui/AppSkeletonList.vue'
import AppEmptyState from '@/shared/ui/AppEmptyState.vue'

const authStore = useAuthStore()

const allAppointments = ref<Appointment[]>([])
const loading = ref(true)
const error = ref('')
const tab = ref<'upcoming' | 'past'>('upcoming')

const today = new Date().toISOString().split('T')[0]

const upcoming = computed(() =>
  allAppointments.value
    .filter((a) => a.date >= today && a.status !== 'cancelled' && a.status !== 'completed')
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)),
)

const past = computed(() =>
  allAppointments.value
    .filter((a) => a.date < today || a.status === 'cancelled')
    .sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`)),
)

const shown = computed(() => (tab.value === 'upcoming' ? upcoming.value : past.value))

async function load() {
  loading.value = true
  error.value = ''
  try {
    const all = await appointmentsApi.list()
    // Filter to show only this patient's appointments
    const patientId = authStore.patientId
    allAppointments.value = patientId ? all.filter((a) => a.patientId === patientId) : all
  } catch (err) {
    error.value = mapApiError(err)
  } finally {
    loading.value = false
  }
}

function formatDate(date: string) {
  return new Date(date + 'T00:00:00').toLocaleDateString('pt-BR', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pendente', color: 'warning' },
  confirmed: { label: 'Confirmada', color: 'positive' },
  completed: { label: 'Realizada', color: 'info' },
  cancelled: { label: 'Cancelada', color: 'negative' },
}

onMounted(load)
</script>

<template>
  <q-page class="q-pa-md max-w-3xl mx-auto">
    <AppPageHeader title="Minhas Consultas">
      <template #actions>
        <AppButton label="Agendar" icon="add" color="primary" @click="$router.push('/appointments/new')" />
      </template>
    </AppPageHeader>

    <q-tabs
      v-model="tab"
      align="justify"
      class="mb-4 rounded-lg bg-surface-alt"
      indicator-color="primary"
      active-color="primary"
    >
      <q-tab name="upcoming" label="Próximas" />
      <q-tab name="past" label="Histórico" />
    </q-tabs>

    <AppErrorBanner v-if="error" :message="error" retry-label="Tentar novamente" @retry="load" />

    <AppSkeletonList v-else-if="loading" :count="5" />

    <AppEmptyState
      v-else-if="shown.length === 0"
      icon="event_available"
      :title="tab === 'upcoming' ? 'Sem consultas agendadas' : 'Sem histórico de consultas'"
      :description="tab === 'upcoming' ? 'Agende uma nova consulta para começar.' : 'Suas consultas anteriores aparecerão aqui.'"
      :action-label="tab === 'upcoming' ? 'Agendar consulta' : undefined"
      @action="$router.push('/appointments/new')"
    />

    <div v-else class="flex flex-col gap-3">
      <q-card
        v-for="appt in shown"
        :key="appt.id"
        bordered
        flat
        class="rounded-lg cursor-pointer hover:shadow-sm transition-shadow"
        @click="$router.push(`/appointments/${appt.id}`)"
      >
        <q-card-section class="flex gap-3 items-start q-py-sm">
          <div class="bg-primary/10 rounded-lg p-2 shrink-0">
            <q-icon name="event" color="primary" size="24px" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-body2 font-semibold text-text-primary m-0 truncate">
              {{ appt.doctor?.name ?? 'Médico' }}
            </p>
            <p class="text-caption text-text-secondary m-0">
              {{ formatDate(appt.date) }} às {{ appt.time.slice(0, 5) }}
            </p>
            <p class="text-caption text-text-secondary m-0">Cód: {{ appt.code }}</p>
          </div>
          <div class="flex flex-col items-end gap-1 shrink-0">
            <q-chip
              dense
              :color="statusMap[appt.status]?.color ?? 'grey'"
              text-color="white"
              size="10px"
              :label="statusMap[appt.status]?.label ?? appt.status"
            />
            <q-icon name="chevron_right" color="grey-5" size="20px" />
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>
