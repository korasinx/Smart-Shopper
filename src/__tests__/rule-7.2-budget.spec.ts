import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import ListSummaryBar from '@/components/ListSummaryBar.vue'
import { getBudgetStatus } from '@/utils/totals'
import { useToastNotifications } from '@/composables/useToastNotifications'
import { useBackup } from '@/composables/useBackup'
import { useListsStore } from '@/stores/lists'
import { db } from '@/db'
import type { ShoppingItem } from '@/db'
import type { BackupData } from '@/composables/useBackup'

const plain = (text: string) => text.replace(/ /g, ' ').replace(/\s+/g, ' ').trim()

function makeItem(id: string, price: number | undefined, completed = false): ShoppingItem {
  return {
    id,
    listId: 'l1',
    name: `Item ${id}`,
    quantity: 1,
    category: 'pantry',
    completed,
    addedAt: 1,
    price,
  }
}

describe('Rule 7.2: Limite de gasto por lista', () => {
  let vibrate: ReturnType<typeof vi.fn>

  beforeEach(() => {
    setActivePinia(createPinia())
    vibrate = vi.fn()
    Object.defineProperty(navigator, 'vibrate', { value: vibrate, configurable: true })
  })

  afterEach(() => {
    Reflect.deleteProperty(navigator, 'vibrate')
  })

  describe('getBudgetStatus', () => {
    it('sem limite não há faixa nem previsão', () => {
      expect(getBudgetStatus(50, 80, undefined)).toBeNull()
    })

    it('calcula quanto resta e o percentual', () => {
      const s = getBudgetStatus(40, 40, 100)!
      expect(s.remaining).toBe(60)
      expect(s.percent).toBe(40)
      expect(s.level).toBe('normal')
    })

    it.each([
      [0, 'normal'],
      [89, 'normal'],
      [89.99, 'normal'],
      [90, 'warning'],
      [99.5, 'warning'],
      [100, 'warning'],
      [100.01, 'over'],
      [130, 'over'],
    ])('carrinho de R$ %d de um limite de R$ 100 fica %s', (inCart, level) => {
      expect(getBudgetStatus(inCart, inCart, 100)!.level).toBe(level)
    })

    it('acima do limite informa quanto passou e trava a barrinha em 100%', () => {
      const s = getBudgetStatus(125.5, 125.5, 100)!
      expect(s.overBy).toBe(25.5)
      expect(s.percent).toBe(100)
    })

    it('prevê quando a lista toda passa e o carrinho ainda não', () => {
      expect(getBudgetStatus(30, 130, 100)!.forecastOver).toBe(true)
      expect(getBudgetStatus(30, 100, 100)!.forecastOver).toBe(false)
      expect(getBudgetStatus(110, 130, 100)!.forecastOver).toBe(false)
    })
  })

  describe('barra com limite', () => {
    const mountBar = (items: ShoppingItem[], budget?: number) =>
      mount(ListSummaryBar, { props: { items, budget } })

    it('sem limite mostra "Definir limite" e nada de restam, faixa, barrinha ou previsão', () => {
      const wrapper = mountBar([makeItem('1', 500, true), makeItem('2', 900)])
      const text = plain(wrapper.text())
      expect(text).toContain('Definir limite')
      expect(text).not.toContain('Restam')
      expect(text).not.toContain('Perto do limite')
      expect(text).not.toContain('Passou')
      expect(text).not.toContain('acima do limite')
      expect(wrapper.find('[role="progressbar"]').exists()).toBe(false)
      expect(wrapper.find('[data-level]').exists()).toBe(false)
    })

    it('com limite mostra "Limite: R$ 100,00", quanto restam e a barrinha', () => {
      const wrapper = mountBar([makeItem('1', 30, true), makeItem('2', 20)], 100)
      const text = plain(wrapper.text())
      expect(text).toContain('Limite: R$ 100,00')
      expect(text).toContain('Restam R$ 70,00')
      const bar = wrapper.find('[role="progressbar"]')
      expect(bar.attributes('aria-valuenow')).toBe('30')
      expect(wrapper.find('[data-level]').attributes('data-level')).toBe('normal')
    })

    it('até 89% fica normal, sem aviso de texto', () => {
      const wrapper = mountBar([makeItem('1', 89, true)], 100)
      expect(wrapper.find('[data-level]').attributes('data-level')).toBe('normal')
      expect(plain(wrapper.text())).not.toContain('Perto do limite')
    })

    it('de 90% a 100% fica amarelo com o texto "Perto do limite"', () => {
      const wrapper = mountBar([makeItem('1', 90, true)], 100)
      expect(wrapper.find('[data-level]').attributes('data-level')).toBe('warning')
      expect(plain(wrapper.text())).toContain('Perto do limite')
      expect(plain(wrapper.text())).toContain('Restam R$ 10,00')
    })

    it('acima de 100% fica vermelho com "Passou R$ X do limite"', () => {
      const wrapper = mountBar([makeItem('1', 112.5, true)], 100)
      expect(wrapper.find('[data-level]').attributes('data-level')).toBe('over')
      const text = plain(wrapper.text())
      expect(text).toContain('Passou R$ 12,50 do limite')
      expect(text).not.toContain('Restam')
    })

    it('previsão: a lista toda dá mais que o limite e o carrinho ainda não passou', () => {
      const wrapper = mountBar([makeItem('1', 20, true), makeItem('2', 100)], 100)
      expect(plain(wrapper.text())).toContain('A lista toda dá R$ 120,00, acima do limite')
    })

    it('sem previsão quando o carrinho já passou ou a lista cabe', () => {
      const passou = mountBar([makeItem('1', 120, true)], 100)
      expect(plain(passou.text())).not.toContain('A lista toda dá')
      const cabe = mountBar([makeItem('1', 20, true), makeItem('2', 30)], 100)
      expect(plain(cabe.text())).not.toContain('A lista toda dá')
    })
  })

  describe('edição do limite', () => {
    const mountBar = (budget?: number) =>
      mount(ListSummaryBar, {
        props: { items: [makeItem('1', 10)], budget },
        attachTo: document.body,
      })

    it('Definir limite abre o campo decimal e Enter salva com vírgula', async () => {
      const wrapper = mountBar()
      await wrapper.find('[data-testid="budget-button"]').trigger('click')
      const input = wrapper.find('[data-testid="budget-input"]')
      expect(input.attributes('inputmode')).toBe('decimal')
      await input.setValue('150,50')
      await input.trigger('keydown', { key: 'Enter' })
      expect(wrapper.emitted('setBudget')).toEqual([[150.5]])
      wrapper.unmount()
    })

    it('aceita ponto e salva ao sair do campo, uma vez só', async () => {
      const wrapper = mountBar(100)
      await wrapper.find('[data-testid="budget-button"]').trigger('click')
      const input = wrapper.find('[data-testid="budget-input"]')
      expect((input.element as HTMLInputElement).value).toBe('100,00')
      await input.setValue('80.00')
      await input.trigger('blur')
      expect(wrapper.emitted('setBudget')).toEqual([[80]])
      wrapper.unmount()
    })

    it('campo vazio remove o limite', async () => {
      const wrapper = mountBar(100)
      await wrapper.find('[data-testid="budget-button"]').trigger('click')
      const input = wrapper.find('[data-testid="budget-input"]')
      await input.setValue('')
      await input.trigger('keydown', { key: 'Enter' })
      expect(wrapper.emitted('setBudget')).toEqual([[undefined]])
      wrapper.unmount()
    })

    it('valor inválido não salva', async () => {
      const wrapper = mountBar(100)
      await wrapper.find('[data-testid="budget-button"]').trigger('click')
      const input = wrapper.find('[data-testid="budget-input"]')
      await input.setValue('muito')
      await input.trigger('keydown', { key: 'Enter' })
      expect(wrapper.emitted('setBudget')).toBeUndefined()
      wrapper.unmount()
    })
  })

  describe('aviso ao passar do limite', () => {
    const mountBar = (items: ShoppingItem[], budget?: number) =>
      mount(ListSummaryBar, { props: { items, budget } })

    const cart = (value: number) => [makeItem('1', value, true), makeItem('2', 1000)]

    it('vibra e mostra o toast uma vez ao cruzar de dentro para fora', async () => {
      const toasts = useToastNotifications()
      const wrapper = mountBar(cart(50), 100)
      expect(vibrate).not.toHaveBeenCalled()

      await wrapper.setProps({ items: cart(101) })
      expect(vibrate).toHaveBeenCalledTimes(1)
      expect(vibrate).toHaveBeenCalledWith(200)
      expect(toasts.toasts).toHaveLength(1)
      expect(plain(toasts.toasts[0]!.message)).toBe('Você passou do limite de R$ 100,00')

      // continua acima: não repete a cada item
      await wrapper.setProps({ items: cart(130) })
      await wrapper.setProps({ items: cart(160) })
      expect(vibrate).toHaveBeenCalledTimes(1)
      expect(toasts.toasts).toHaveLength(1)
    })

    it('só avisa de novo se cair abaixo do limite e passar outra vez', async () => {
      const toasts = useToastNotifications()
      const wrapper = mountBar(cart(50), 100)
      await wrapper.setProps({ items: cart(101) })
      await wrapper.setProps({ items: cart(90) })
      expect(vibrate).toHaveBeenCalledTimes(1)
      await wrapper.setProps({ items: cart(120) })
      expect(vibrate).toHaveBeenCalledTimes(2)
      expect(toasts.toasts).toHaveLength(2)
    })

    it('não avisa ao abrir uma lista que já está acima do limite', () => {
      const toasts = useToastNotifications()
      mountBar(cart(150), 100)
      expect(vibrate).not.toHaveBeenCalled()
      expect(toasts.toasts).toHaveLength(0)
    })

    it('exatamente no limite ainda não é passar; sem limite nunca avisa', async () => {
      const toasts = useToastNotifications()
      const wrapper = mountBar(cart(50), 100)
      await wrapper.setProps({ items: cart(100) })
      expect(vibrate).not.toHaveBeenCalled()

      const semLimite = mountBar(cart(50))
      await semLimite.setProps({ items: cart(5000) })
      expect(vibrate).not.toHaveBeenCalled()
      expect(toasts.toasts).toHaveLength(0)
    })

    it('funciona em aparelho sem vibração', async () => {
      Reflect.deleteProperty(navigator, 'vibrate')
      const toasts = useToastNotifications()
      const wrapper = mountBar(cart(50), 100)
      await wrapper.setProps({ items: cart(101) })
      expect(toasts.toasts).toHaveLength(1)
    })

    it('remover o limite some com tudo; definir de novo acima avisa de novo', async () => {
      const toasts = useToastNotifications()
      const wrapper = mountBar(cart(120), 200)
      await wrapper.setProps({ budget: 100 })
      expect(toasts.toasts).toHaveLength(1)
      await wrapper.setProps({ budget: undefined })
      expect(plain(wrapper.text())).toContain('Definir limite')
      expect(plain(wrapper.text())).not.toContain('Passou')
      expect(toasts.toasts).toHaveLength(1)
      await wrapper.setProps({ budget: 50 })
      expect(toasts.toasts).toHaveLength(2)
    })
  })

  describe('persistência do limite', () => {
    it('salva e remove o limite da lista', async () => {
      const listsStore = useListsStore()
      const list = await listsStore.createList('Limite 7.2')
      expect(list.budget).toBeUndefined()

      await listsStore.updateList(list.id, { budget: 100 })
      expect((await db.lists.get(list.id))?.budget).toBe(100)
      expect(listsStore.getListById(list.id)?.budget).toBe(100)

      await listsStore.updateList(list.id, { budget: undefined })
      const saved = await db.lists.get(list.id)
      expect(saved?.budget).toBeUndefined()
      expect(saved && 'budget' in saved).toBe(false)
    })

    it('lista antiga sem limite continua funcionando', async () => {
      const listsStore = useListsStore()
      await db.lists.add({
        id: 'antiga-72',
        name: 'Antiga 7.2',
        createdAt: 1,
        updatedAt: 1,
        archived: false,
      })
      await listsStore.loadLists()
      expect(listsStore.getListById('antiga-72')?.budget).toBeUndefined()
    })

    it('duplicar a lista mantém o limite', async () => {
      const listsStore = useListsStore()
      const list = await listsStore.createList('Dup limite 7.2')
      await listsStore.updateList(list.id, { budget: 75 })
      const copy = await listsStore.duplicateList(list.id)
      expect((await db.lists.get(copy.id))?.budget).toBe(75)
    })

    it('backup exporta e restaura o limite; aceita lista sem limite', async () => {
      const listsStore = useListsStore()
      const backup = useBackup()
      await listsStore.loadLists()
      const com = await listsStore.createList('Com limite 7.2')
      await listsStore.updateList(com.id, { budget: 250.5 })
      await listsStore.createList('Sem limite 7.2')

      const data = JSON.parse(JSON.stringify(await backup.exportBackup())) as BackupData
      expect(data.lists.find((l) => l.name === 'Com limite 7.2')?.budget).toBe(250.5)
      expect(data.lists.find((l) => l.name === 'Sem limite 7.2')?.budget).toBeUndefined()

      await backup.importBackup(data)
      await listsStore.loadLists()
      expect(listsStore.lists.find((l) => l.name === 'Com limite 7.2')?.budget).toBe(250.5)
      expect(listsStore.lists.find((l) => l.name === 'Sem limite 7.2')?.budget).toBeUndefined()
    })
  })
})
