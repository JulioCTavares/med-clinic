<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/app/stores/auth.store'
import { appointmentsApi } from '@/features/appointments/api'
import { fetchAllPaginated } from '@/shared/lib/fetch-all-pages'
import { mapApiError } from '@/shared/lib/error-mapper'
import type { Appointment } from '@/entities/appointment'
import AppPageHeader from '@/shared/ui/AppPageHeader.vue'
import AppCard from '@/shared/ui/AppCard.vue'
import AppErrorBanner from '@/shared/ui/AppErrorBanner.vue'
import AppSkeletonList from '@/shared/ui/AppSkeletonList.vue'
import AppEmptyState from '@/shared/ui/AppEmptyState.vue'

const authStore = useAuthStore()

const appointments = ref<Appointment[]>([])
const loading = ref(true)
const error = ref('')

const upcomingAppointments = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return appointments.value
    .filter((a) => a.date >= today && (a.status === 'pending' || a.status === 'confirmed'))
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
    .slice(0, 3)
})

async function load() {
  loading.value = true
  error.value = ''
  try {
    appointments.value = await fetchAllPaginated((page, limit) =>
      appointmentsApi.list({ page, limit }),
    )
  } catch (err) {
    error.value = mapApiError(err)
  } finally {
    loading.value = false
  }
}

function formatDate(date: string) {
  return new Date(date + 'T00:00:00').toLocaleDateString('pt-BR', {
    weekday: 'short', day: 'numeric', month: 'short',
  })
}

onMounted(load)
</script>

<template>
  <q-page class="q-pa-md max-w-3xl mx-auto">
    <AppPageHeader
      :title="`Olá, ${authStore.patient?.name?.split(' ')[0] ?? 'Paciente'}`"
      subtitle="Aqui está um resumo da sua saúde"
    />

    <!-- Quick actions -->
    <div class="grid grid-cols-2 gap-3 mb-6">
      <AppCard clickable @click="$router.push('/appointments/new')">
        <div class="flex flex-col items-center py-2 gap-2">
          <q-icon name="add_circle" size="36px" color="primary" />
          <span class="text-body2 font-medium text-text-primary text-center">Agendar Consulta</span>
        </div>
      </AppCard>
      <AppCard clickable @click="$router.push('/appointments')">
        <div class="flex flex-col items-center py-2 gap-2">
          <q-icon name="calendar_month" size="36px" color="secondary" />
          <span class="text-body2 font-medium text-text-primary text-center">Minhas Consultas</span>
        </div>
      </AppCard>
      <AppCard clickable @click="$router.push('/health-plans')">
        <div class="flex flex-col items-center py-2 gap-2">
          <q-icon name="health_and_safety" size="36px" color="positive" />
          <span class="text-body2 font-medium text-text-primary text-center">Planos de Saúde</span>
        </div>
      </AppCard>
      <AppCard clickable @click="$router.push('/profile')">
        <div class="flex flex-col items-center py-2 gap-2">
          <q-icon name="person" size="36px" color="info" />
          <span class="text-body2 font-medium text-text-primary text-center">Meu Perfil</span>
        </div>
      </AppCard>
    </div>

    <!-- Upcoming appointments -->
    <div class="mb-4 flex items-center justify-between">
      <h2 class="text-subtitle1 font-semibold text-text-primary m-0">Próximas consultas</h2>
      <q-btn flat no-caps to="/appointments" label="Ver todas" color="primary" dense />
    </div>

    <AppErrorBanner v-if="error" :message="error" retry-label="Tentar novamente" @retry="load" />

    <AppSkeletonList v-else-if="loading" :count="3" />

    <AppEmptyState
      v-else-if="upcomingAppointments.length === 0"
      icon="event_available"
      title="Nenhuma consulta agendada"
      description="Agende sua primeira consulta e cuide da sua saúde."
      action-label="Agendar agora"
      @action="$router.push('/appointments/new')"
    />

    <div v-else class="flex flex-col gap-3">
      <AppCard
        v-for="appt in upcomingAppointments"
        :key="appt.id"
        clickable
        @click="$router.push(`/appointments/${appt.id}`)"
      >
        <div class="flex gap-3 items-start">
          <div class="bg-primary/10 rounded-lg p-2 shrink-0">
            <q-icon name="event" color="primary" size="24px" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-body2 font-semibold text-text-primary m-0 truncate">
              {{ appt.doctor?.name ?? 'Médico' }}
            </p>
            <p class="text-caption text-text-secondary m-0">{{ formatDate(appt.date) }} às {{ appt.time.slice(0, 5) }}</p>
            <q-chip
              dense
              color="positive"
              text-color="white"
              size="10px"
              class="mt-1"
              label="Agendada"
            />
          </div>
          <q-icon name="chevron_right" color="grey-5" size="20px" />
        </div>
      </AppCard>
    </div>
  </q-page>
</template>
