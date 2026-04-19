<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from '@/app/stores/auth.store'
import { appointmentsApi } from '@/features/appointments/api'
import { catalogApi } from '@/shared/lib/catalog-api'
import { fetchAllPaginated } from '@/shared/lib/fetch-all-pages'
import { mapApiError } from '@/shared/lib/error-mapper'
import type { Specialty } from '@/entities/specialty'
import type { Doctor } from '@/entities/doctor'
import AppPageHeader from '@/shared/ui/AppPageHeader.vue'
import AppButton from '@/shared/ui/AppButton.vue'
import AppSelect from '@/shared/ui/AppSelect.vue'
import AppTextField from '@/shared/ui/AppTextField.vue'
import AppErrorBanner from '@/shared/ui/AppErrorBanner.vue'

const $q = useQuasar()
const router = useRouter()
const authStore = useAuthStore()

const step = ref(1)
const submitting = ref(false)
const error = ref('')

const specialties = ref<Specialty[]>([])
const allDoctors = ref<Doctor[]>([])
const loadingCatalog = ref(true)

const selectedSpecialtyId = ref<string | null>(null)
const selectedDoctorId = ref<string | null>(null)
const date = ref('')
const time = ref('')
const isPrivate = ref(false)
const minAppointmentDate = computed(() => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow.toISOString().split('T')[0]
})
const fixedTimeOptions = computed(() =>
  Array.from({ length: 19 }, (_, idx) => {
    const totalMinutes = 8 * 60 + idx * 30
    const hour = Math.floor(totalMinutes / 60)
    const minute = totalMinutes % 60
    const value = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
    return { label: value, value }
  }),
)

function normalizeId(value: unknown): string | undefined {
  if (typeof value === 'string') {
    const normalized = value.trim()
    return normalized.length > 0 ? normalized : undefined
  }
  if (value && typeof value === 'object') {
    const source = value as { id?: unknown; value?: unknown }
    return normalizeId(source.value) ?? normalizeId(source.id)
  }
  return undefined
}

function getDoctorSpecialtyId(doctor: Doctor): string | undefined {
  const source = doctor as Doctor & {
    specialty_id?: string
    specialty?: { id?: string }
  }
  return normalizeId(source.specialtyId)
    ?? normalizeId(source.specialty_id)
    ?? normalizeId(source.specialty?.id)
}

const filteredDoctors = computed(() => {
  const selected = normalizeId(selectedSpecialtyId.value)
  if (!selected) return allDoctors.value
  return allDoctors.value.filter((d) => String(getDoctorSpecialtyId(d) ?? '').trim() === selected)
})

const specialtyOptions = computed(() =>
  specialties.value.map((s) => ({ label: s.name, value: s.id })),
)

const doctorOptions = computed(() =>
  filteredDoctors.value.map((d) => ({ label: d.name, value: d.id })),
)

const canProceedStep1 = computed(() => !!selectedSpecialtyId.value)
const canProceedStep2 = computed(() => !!selectedDoctorId.value)
const canSubmit = computed(() => !!date.value && !!time.value)

watch(selectedSpecialtyId, () => {
  selectedDoctorId.value = null
})

async function loadCatalog() {
  loadingCatalog.value = true
  try {
    const [specs, docs] = await Promise.all([
      fetchAllPaginated((page, limit) => catalogApi.specialties({ page, limit })),
      fetchAllPaginated((page, limit) => catalogApi.doctors({ page, limit })),
    ])
    specialties.value = specs
    allDoctors.value = docs.map((doctor) => {
      const normalizedSpecialtyId = getDoctorSpecialtyId(doctor)
      if (!normalizedSpecialtyId) return doctor
      return { ...doctor, specialtyId: normalizedSpecialtyId }
    })
  } catch {
    error.value = 'Erro ao carregar catálogo. Tente novamente.'
  } finally {
    loadingCatalog.value = false
  }
}

function generateCode() {
  return `APT-${Date.now().toString(36).toUpperCase()}`
}

async function submit() {
  if (!selectedDoctorId.value || !date.value || !time.value || !authStore.patientId) return
  submitting.value = true
  error.value = ''
  try {
    await appointmentsApi.create({
      code: generateCode(),
      date: date.value,
      time: time.value,
      isPrivate: isPrivate.value,
      patientId: authStore.patientId,
      doctorId: selectedDoctorId.value,
    })
    $q.notify({ type: 'positive', message: 'Consulta agendada com sucesso!' })
    router.push('/appointments')
  } catch (err) {
    error.value = mapApiError(err)
    step.value = 3
  } finally {
    submitting.value = false
  }
}

onMounted(loadCatalog)
</script>

<template>
  <q-page class="q-pa-md max-w-2xl mx-auto">
    <AppPageHeader title="Agendar Consulta" back-route="/appointments" />

    <!-- Progress stepper -->
    <q-stepper
      v-model="step"
      color="primary"
      animated
      flat
      class="rounded-xl mb-6 bg-surface"
    >
      <!-- Step 1: Specialty -->
      <q-step :name="1" title="Especialidade" icon="medical_services" :done="step > 1">
        <div class="py-2">
          <p class="text-body2 text-text-secondary mb-4">
            Escolha a especialidade médica que você precisa
          </p>
          <AppSelect
            v-model="selectedSpecialtyId"
            :options="specialtyOptions"
            label="Especialidade"
            :loading="loadingCatalog"
            :emit-value="true"
            :map-options="true"
            option-label="label"
            option-value="value"
          />
        </div>
        <q-stepper-navigation>
          <AppButton
            label="Continuar"
            color="primary"
            :disabled="!canProceedStep1"
            @click="step = 2"
          />
        </q-stepper-navigation>
      </q-step>

      <!-- Step 2: Doctor -->
      <q-step :name="2" title="Médico" icon="person" :done="step > 2">
        <div class="py-2">
          <p class="text-body2 text-text-secondary mb-4">
            Selecione o médico da sua preferência
          </p>
          <AppSelect
            v-model="selectedDoctorId"
            :options="doctorOptions"
            label="Médico"
            :loading="loadingCatalog"
            :emit-value="true"
            :map-options="true"
            option-label="label"
            option-value="value"
          />
          <p
            v-if="!loadingCatalog && selectedSpecialtyId && doctorOptions.length === 0"
            class="text-caption text-warning q-mt-sm"
          >
            Nenhum médico disponível para a especialidade selecionada.
          </p>
        </div>
        <q-stepper-navigation class="flex gap-2">
          <AppButton label="Voltar" flat color="grey" @click="step = 1" />
          <AppButton label="Continuar" color="primary" :disabled="!canProceedStep2" @click="step = 3" />
        </q-stepper-navigation>
      </q-step>

      <!-- Step 3: Date & Time -->
      <q-step :name="3" title="Data e hora" icon="calendar_month">
        <div class="py-2 flex flex-col gap-4">
          <p class="text-body2 text-text-secondary">Escolha a data e hora da consulta</p>

          <AppErrorBanner v-if="error" :message="error" />

          <AppTextField
            v-model="date"
            label="Data"
            type="date"
            icon="calendar_today"
            :min="minAppointmentDate"
            required
          />

          <AppSelect
            v-model="time"
            label="Horário"
            :options="fixedTimeOptions"
            option-label="label"
            option-value="value"
            :emit-value="true"
            :map-options="true"
            required
          />

          <q-checkbox v-model="isPrivate" label="Consulta particular (sem convênio)" class="text-body2" />
        </div>
        <q-stepper-navigation class="flex gap-2">
          <AppButton label="Voltar" flat color="grey" @click="step = 2" />
          <AppButton
            label="Confirmar agendamento"
            color="primary"
            :disabled="!canSubmit"
            :loading="submitting"
            @click="submit"
          />
        </q-stepper-navigation>
      </q-step>
    </q-stepper>
  </q-page>
</template>
