import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/dashboard' },
      {
        path: 'dashboard',
        component: () => import('@/pages/DashboardPage.vue'),
        meta: { title: 'Início' },
      },
      {
        path: 'appointments',
        component: () => import('@/pages/AppointmentsPage.vue'),
        meta: { title: 'Minhas Consultas' },
      },
      {
        path: 'appointments/new',
        component: () => import('@/pages/NewAppointmentPage.vue'),
        meta: { title: 'Agendar Consulta' },
      },
      {
        path: 'appointments/:id',
        component: () => import('@/pages/AppointmentDetailPage.vue'),
        meta: { title: 'Detalhe da Consulta' },
      },
      {
        path: 'profile',
        component: () => import('@/pages/ProfilePage.vue'),
        meta: { title: 'Meu Perfil' },
      },
      {
        path: 'health-plans',
        component: () => import('@/pages/HealthPlansPage.vue'),
        meta: { title: 'Planos de Saúde' },
      },
    ],
  },
  {
    path: '/auth',
    component: () => import('@/layouts/AuthLayout.vue'),
    children: [
      { path: '', redirect: '/auth/login' },
      {
        path: 'login',
        component: () => import('@/pages/LoginPage.vue'),
        meta: { title: 'Entrar' },
      },
      {
        path: 'register',
        component: () => import('@/pages/RegisterPage.vue'),
        meta: { title: 'Criar conta' },
      },
    ],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('@/pages/ErrorNotFound.vue'),
  },
]

export default routes
