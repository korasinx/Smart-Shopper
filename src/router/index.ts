import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'lists',
      component: () => import('../views/ListsView.vue'),
    },
    {
      path: '/list/:id',
      name: 'list-detail',
      component: () => import('../views/ListDetailView.vue'),
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/SettingsView.vue'),
    },
  ],
})

// Depois de uma atualização, o celular pode ter a tela inicial nova e as telas
// antigas no cache. Se uma tela não carregar, recarrega uma vez na rota pedida.
router.onError((error, to) => {
  const chunkFailed =
    /dynamically imported module|Importing a module script failed|Failed to fetch/i
  if (!chunkFailed.test(String(error?.message))) return
  const key = 'reload-after-chunk-error'
  try {
    if (sessionStorage.getItem(key)) return
    sessionStorage.setItem(key, '1')
  } catch {
    return
  }
  window.location.assign(router.resolve(to.fullPath).href)
})

router.afterEach(() => {
  try {
    sessionStorage.removeItem('reload-after-chunk-error')
  } catch {
    // sem sessionStorage: segue sem a proteção
  }
})

export default router
