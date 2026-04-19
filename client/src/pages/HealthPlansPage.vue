<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useAuthStore } from '@/app/stores/auth.store'
import { healthPlansApi } from '@/features/health-plans/api'
import { fetchAllPaginated } from '@/shared/lib/fetch-all-pages'
import { mapApiError } from '@/shared/lib/error-mapper'
import type { HealthPlan } from '@/entities/health-plan'
import AppPageHeader from '@/shared/ui/AppPageHeader.vue'
import AppCard from '@/shared/ui/AppCard.vue'
import AppErrorBanner from '@/shared/ui/AppErrorBanner.vue'
import AppSkeletonList from '@/shared/ui/AppSkeletonList.vue'
import AppEmptyState from '@/shared/ui/AppEmptyState.vue'

const $q = useQuasar()
const authStore = useAuthStore()

const allPlans = ref<HealthPlan[]>([])
const myPlans = ref<HealthPlan[]>([])
const loading = ref(true)
const associating = ref<string | null>(null)
const error = ref('')

const myPlanIds = computed(() => new Set(myPlans.value.map((p) => p.id)))
const availablePlans = computed(() => allPlans.value.filter((p) => !myPlanIds.value.has(p.id)))

async function load() {
  loading.value = true
  error.value = ''
  try {
    const [all, mine] = await Promise.all([
      fetchAllPaginated((page, limit) => healthPlansApi.list({ page, limit })),
      authStore.patientId ? healthPlansApi.listPatientPlans(authStore.patientId) : Promise.resolve([]),
    ])
    allPlans.value = all
    myPlans.value = mine
  } catch (err) {
    error.value = mapApiError(err)
  } finally {
    loading.value = false
  }
}

function associate(planId: string) {
  $q.dialog({
    title: 'Vincular plano',
    message: 'Informe o número do contrato com o plano de saúde:',
    prompt: { model: '', label: 'Número do contrato', isValid: (v) => v.length > 0 },
    cancel: { label: 'Cancelar', flat: true },
    ok: { label: 'Vincular', color: 'primary' },
  }).onOk(async (contractNumber: string) => {
    if (!authStore.patientId) return
    associating.value = planId
    try {
      await healthPlansApi.associate(authStore.patientId, planId, contractNumber)
      const plan = allPlans.value.find((p) => p.id === planId)
      if (plan) myPlans.value.push(plan)
      $q.notify({ type: 'positive', message: 'Plano associado com sucesso!' })
    } catch (err) {
      $q.notify({ type: 'negative', message: mapApiError(err) })
    } finally {
      associating.value = null
    }
  })
}

onMounted(load)
</script>

<template>
  <q-page class="q-pa-md max-w-3xl mx-auto">
    <AppPageHeader title="Planos de Saúde" subtitle="Gerencie seus planos vinculados" />

    <AppErrorBanner v-if="error" :message="error" retry-label="Tentar novamente" @retry="load" />

    <AppSkeletonList v-if="loading" :count="4" />

    <template v-else>
      <!-- My plans -->
      <div class="mb-6">
        <h2 class="text-subtitle1 font-semibold text-text-primary mb-3">Meus planos</h2>
        <AppEmptyState
          v-if="myPlans.length === 0"
          icon="health_and_safety"
          title="Nenhum plano vinculado"
          description="Vincule um plano de saúde abaixo para agilizar seus agendamentos."
        />
        <div v-else class="flex flex-col gap-3">
          <q-card
            v-for="plan in myPlans"
            :key="plan.id"
            bordered
            flat
            class="rounded-lg"
          >
            <q-card-section class="flex items-center gap-3 q-py-sm">
              <div class="bg-positive/10 rounded-full p-2">
                <q-icon name="check_circle" color="positive" size="24px" />
              </div>
              <div class="flex-1">
                <p class="text-body2 font-semibold text-text-primary m-0">{{ plan.code }}</p>
                <p class="text-caption text-text-secondary m-0">{{ plan.description }}</p>
              </div>
              <q-chip dense color="positive" text-color="white" label="Vinculado" size="10px" />
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Available plans -->
      <div v-if="availablePlans.length > 0">
        <h2 class="text-subtitle1 font-semibold text-text-primary mb-3">Planos disponíveis</h2>
        <div class="flex flex-col gap-3">
          <q-card
            v-for="plan in availablePlans"
            :key="plan.id"
            bordered
            flat
            class="rounded-lg"
          >
            <q-card-section class="flex items-center gap-3 q-py-sm">
              <div class="bg-blue-50 dark:bg-blue-900/20 rounded-full p-2">
                <q-icon name="health_and_safety" color="primary" size="24px" />
              </div>
              <div class="flex-1">
                <p class="text-body2 font-semibold text-text-primary m-0">{{ plan.code }}</p>
                <p class="text-caption text-text-secondary m-0">{{ plan.description }}</p>
              </div>
              <q-btn
                label="Vincular"
                color="primary"
                no-caps
                rounded
                dense
                size="sm"
                outline
                :loading="associating === plan.id"
                @click="associate(plan.id)"
              />
            </q-card-section>
          </q-card>
        </div>
      </div>
    </template>
  </q-page>
</template>
