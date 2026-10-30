import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import CategorySection from '@/components/CategorySection.vue'
import ListSummaryBar from '@/components/ListSummaryBar.vue'
import { formatBRL, parseMoneyInput } from '@/utils/money'
import { calculateTotals } from '@/utils/totals'
import { useBackup } from '@/composables/useBackup'
import { useListsStore } from '@/stores/lists'
import { useItemsStore } from '@/stores/items'
import { db } from '@/db'
import type { ShoppingItem } from '@/db'
import type { BackupData } from '@/composables/useBackup'

// Intl usa espaço sem quebra entre "R$" e o valor; nos testes normalizamos para espaço comum
const plain = (text: string) => text.replace(/ /g, ' ').replace(/\s+/g, ' ').trim()

function makeItem(id: string, opts: Partial<ShoppingItem> = {}, category = 'pantry'): ShoppingItem {
  return {
    id,
    listId: 'l1',
    name: `Item ${id}`,
    quantity: 1,
    category,
    completed: false,
    addedAt: Number(id.replace(/\D/g, '')) || 1,
    ...opts,
  }
}

describe('Rule 7.1: Preço opcional por item e soma da lista', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('formatBRL e parseMoneyInput', () => {
    it('formata em reais', () => {
      expect(plain(formatBRL(12.9))).toBe('R$ 12,90')
      expect(plain(formatBRL(0))).toBe('R$ 0,00')
      expect(plain(formatBRL(1234.5))).toBe('R$ 1.234,50')
    })

    it.each([
      ['12,90', 12.9],
      ['12.90', 12.9],
      ['R$ 12,90', 12.9],
      ['1.234,56', 1234.56],
      ['5', 5],
      ['0,5', 0.5],
      ['  4,5  ', 4.5],
    ])('aceita "%s" como %d', (text, value) => {
      expect(parseMoneyInput(text)).toEqual({ valid: true, value })
    })

    it('campo vazio é válido e significa remover', () => {
      expect(parseMoneyInput('')).toEqual({ valid: true, value: undefined })
      expect(parseMoneyInput('   ')).toEqual({ valid: true, value: undefined })
    })

    it.each(['abc', '-3', '12,345', '1,2,3', '12,'])('rejeita "%s"', (text) => {
      expect(parseMoneyInput(text).valid).toBe(false)
    })
  })

  describe('calculateTotals', () => {
    it('multiplica preço por quantidade e separa o que está no carrinho', () => {
      const items = [
        makeItem('1', { price: 4.5, quantity: 2 }),
        makeItem('2', { price: 10, completed: true }),
        makeItem('3', { price: 0.1, quantity: 3, completed: true }),
        makeItem('4'),
      ]
      expect(calculateTotals(items)).toEqual({ inCart: 10.3, total: 19.3, withoutPrice: 1 })
    })

    it('lista sem nenhum preço soma zero e conta os itens sem preço', () => {
      expect(calculateTotals([makeItem('1'), makeItem('2', { completed: true })])).toEqual({
        inCart: 0,
        total: 0,
        withoutPrice: 2,
      })
      expect(calculateTotals([])).toEqual({ inCart: 0, total: 0, withoutPrice: 0 })
    })

    it('item riscado sem preço não quebra nem entra na soma', () => {
      expect(calculateTotals([makeItem('1', { completed: true })]).inCart).toBe(0)
    })
  })

  describe('preço na linha do item', () => {
    const mountSection = (items: ShoppingItem[]) =>
      mount(CategorySection, { props: { categoryId: 'pantry', items }, attachTo: document.body })

    it('sem preço mostra "R$ —"; com preço mostra o valor', () => {
      const wrapper = mountSection([makeItem('1'), makeItem('2', { price: 12.9 })])
      const buttons = wrapper.findAll('[data-testid="price-button"]')
      expect(plain(buttons[0]!.text())).toBe('R$ —')
      expect(plain(buttons[1]!.text())).toBe('R$ 12,90')
      wrapper.unmount()
    })

    it('tocar no botão abre o campo decimal sem riscar o item', async () => {
      const wrapper = mountSection([makeItem('1')])
      await wrapper.find('[data-testid="price-button"]').trigger('click')
      const input = wrapper.find('[data-testid="price-input"]')
      expect(input.exists()).toBe(true)
      expect(input.attributes('inputmode')).toBe('decimal')
      await input.trigger('click')
      expect(wrapper.emitted('toggleItem')).toBeUndefined()
      wrapper.unmount()
    })

    it.each([
      ['12,90', 12.9],
      ['12.90', 12.9],
    ])('Enter salva "%s" como %d', async (text, value) => {
      const wrapper = mountSection([makeItem('1')])
      await wrapper.find('[data-testid="price-button"]').trigger('click')
      const input = wrapper.find('[data-testid="price-input"]')
      await input.setValue(text)
      await input.trigger('keydown', { key: 'Enter' })
      expect(wrapper.emitted('setPrice')).toEqual([['1', value]])
      expect(wrapper.emitted('toggleItem')).toBeUndefined()
      wrapper.unmount()
    })

    it('sair do campo salva uma vez só', async () => {
      const wrapper = mountSection([makeItem('1')])
      await wrapper.find('[data-testid="price-button"]').trigger('click')
      const input = wrapper.find('[data-testid="price-input"]')
      await input.setValue('3,25')
      await input.trigger('blur')
      expect(wrapper.emitted('setPrice')).toEqual([['1', 3.25]])
      expect(wrapper.find('[data-testid="price-input"]').exists()).toBe(false)
      wrapper.unmount()
    })

    it('campo vazio remove o preço', async () => {
      const wrapper = mountSection([makeItem('1', { price: 5 })])
      await wrapper.find('[data-testid="price-button"]').trigger('click')
      const input = wrapper.find('[data-testid="price-input"]')
      expect((input.element as HTMLInputElement).value).toBe('5,00')
      await input.setValue('')
      await input.trigger('keydown', { key: 'Enter' })
      expect(wrapper.emitted('setPrice')).toEqual([['1', undefined]])
      wrapper.unmount()
    })

    it('valor inválido não salva e Esc cancela', async () => {
      const wrapper = mountSection([makeItem('1')])
      await wrapper.find('[data-testid="price-button"]').trigger('click')
      const input = wrapper.find('[data-testid="price-input"]')
      await input.setValue('abc')
      await input.trigger('keydown', { key: 'Enter' })
      expect(wrapper.emitted('setPrice')).toBeUndefined()
      expect(wrapper.find('[data-testid="price-input"]').attributes('aria-invalid')).toBe('true')
      await input.trigger('keydown', { key: 'Escape' })
      expect(wrapper.find('[data-testid="price-input"]').exists()).toBe(false)
      expect(wrapper.emitted('setPrice')).toBeUndefined()
      wrapper.unmount()
    })

    it('quantidade maior que 1 mostra "2 × R$ 4,50"', () => {
      const wrapper = mountSection([
        makeItem('1', { price: 4.5, quantity: 2 }),
        makeItem('2', { price: 4.5 }),
      ])
      expect(plain(wrapper.text())).toContain('2 × R$ 4,50')
      expect(plain(wrapper.text())).not.toContain('1 × R$')
      wrapper.unmount()
    })
  })

  describe('barra de soma', () => {
    const mountBar = (items: ShoppingItem[]) => mount(ListSummaryBar, { props: { items } })

    it('mostra No carrinho, Total da lista e itens sem preço', () => {
      const wrapper = mountBar([
        makeItem('1', { price: 4.5, quantity: 2, completed: true }),
        makeItem('2', { price: 10 }),
        makeItem('3'),
        makeItem('4'),
      ])
      const text = plain(wrapper.text())
      expect(text).toContain('No carrinho: R$ 9,00')
      expect(text).toContain('Total da lista: R$ 19,00')
      expect(text).toContain('2 itens sem preço')
    })

    it('lista sem nenhum preço mostra R$ 0,00 e a contagem, sem inventar valores', () => {
      const wrapper = mountBar([makeItem('1'), makeItem('2')])
      const text = plain(wrapper.text())
      expect(text).toContain('No carrinho: R$ 0,00')
      expect(text).toContain('Total da lista: R$ 0,00')
      expect(text).toContain('2 itens sem preço')
    })

    it('usa singular com 1 item e some quando todos têm preço', async () => {
      const wrapper = mountBar([makeItem('1', { price: 1 }), makeItem('2')])
      expect(plain(wrapper.text())).toContain('1 item sem preço')
      await wrapper.setProps({ items: [makeItem('1', { price: 1 }), makeItem('2', { price: 2 })] })
      expect(plain(wrapper.text())).not.toContain('sem preço')
    })

    it('riscar e desriscar muda "No carrinho"', async () => {
      const items = [makeItem('1', { price: 10 }), makeItem('2', { price: 5 })]
      const wrapper = mountBar(items)
      expect(plain(wrapper.text())).toContain('No carrinho: R$ 0,00')
      await wrapper.setProps({
        items: [makeItem('1', { price: 10, completed: true }), makeItem('2', { price: 5 })],
      })
      expect(plain(wrapper.text())).toContain('No carrinho: R$ 10,00')
      expect(plain(wrapper.text())).toContain('Total da lista: R$ 15,00')
      await wrapper.setProps({ items })
      expect(plain(wrapper.text())).toContain('No carrinho: R$ 0,00')
    })

    it('é uma barra fixa no rodapé', () => {
      const wrapper = mountBar([makeItem('1')])
      expect(wrapper.classes()).toContain('sticky')
      expect(wrapper.classes()).toContain('bottom-0')
    })
  })

  describe('persistência', () => {
    it('salva e remove o preço do item no banco e na memória', async () => {
      const listsStore = useListsStore()
      const itemsStore = useItemsStore()
      const list = await listsStore.createList('Preços 7.1')
      const item = await itemsStore.createItem(list.id, 'Arroz', 'pantry')
      expect(item.price).toBeUndefined()

      await itemsStore.updateItem(list.id, item.id, { price: 12.9 })
      expect((await db.items.get(item.id))?.price).toBe(12.9)

      await itemsStore.updateItem(list.id, item.id, { price: undefined })
      const saved = await db.items.get(item.id)
      expect(saved?.price).toBeUndefined()
      expect(saved && 'price' in saved).toBe(false)
      expect(itemsStore.getItemsByListId(list.id).value[0]?.price).toBeUndefined()
    })

    it('item antigo sem preço continua funcionando', async () => {
      const listsStore = useListsStore()
      const itemsStore = useItemsStore()
      const list = await listsStore.createList('Antiga 7.1')
      await db.items.add({
        id: 'antigo-71',
        listId: list.id,
        name: 'Feijão',
        quantity: 1,
        category: 'pantry',
        completed: false,
        addedAt: 1,
      })
      await itemsStore.loadItems(list.id)
      const items = itemsStore.getItemsByListId(list.id).value
      expect(items).toHaveLength(1)
      expect(calculateTotals(items).withoutPrice).toBe(1)
      await itemsStore.toggleItemComplete(list.id, 'antigo-71')
      expect(calculateTotals(items).inCart).toBe(0)
    })

    it('duplicar a lista mantém os preços', async () => {
      const listsStore = useListsStore()
      const itemsStore = useItemsStore()
      const list = await listsStore.createList('Original 7.1')
      const item = await itemsStore.createItem(list.id, 'Leite', 'dairy')
      await itemsStore.updateItem(list.id, item.id, { price: 5.5 })
      const copy = await listsStore.duplicateList(list.id)
      const copied = await db.items.where('listId').equals(copy.id).toArray()
      expect(copied[0]?.price).toBe(5.5)
    })
  })

  describe('backup', () => {
    it('exporta e restaura preço e quantidade; aceita itens sem preço', async () => {
      const listsStore = useListsStore()
      const itemsStore = useItemsStore()
      const backup = useBackup()
      await listsStore.loadLists()

      const list = await listsStore.createList('Backup preços 7.1')
      const withPrice = await itemsStore.createItem(list.id, 'Café 7.1', 'pantry')
      await itemsStore.updateItem(list.id, withPrice.id, { price: 18.9, quantity: 2 })
      await itemsStore.createItem(list.id, 'Sal 7.1', 'pantry')

      const data = await backup.exportBackup()
      const exported = data.items.filter((i) => i.listId === list.id)
      expect(exported.find((i) => i.name === 'Café 7.1')?.price).toBe(18.9)

      const json = JSON.parse(JSON.stringify(data)) as BackupData
      await backup.importBackup(json)

      await listsStore.loadLists()
      const restored = listsStore.lists.find((l) => l.name === 'Backup preços 7.1')
      expect(restored).toBeDefined()
      await itemsStore.loadItems(restored!.id)
      const items = itemsStore.getItemsByListId(restored!.id).value
      const cafe = items.find((i) => i.name === 'Café 7.1')
      expect(cafe?.price).toBe(18.9)
      expect(cafe?.quantity).toBe(2)
      expect(items.find((i) => i.name === 'Sal 7.1')?.price).toBeUndefined()
    })

    it('backup antigo, sem o campo de preço, continua sendo aceito', async () => {
      const backup = useBackup()
      const old: BackupData = {
        version: '1.0.0',
        timestamp: Date.now(),
        lists: [
          { id: 'old-l', name: 'Backup antigo 7.1', createdAt: 1, updatedAt: 1, archived: false },
        ],
        items: [
          {
            id: 'old-i',
            listId: 'old-l',
            name: 'Pão',
            quantity: 1,
            category: 'bakery',
            completed: false,
            addedAt: 1,
          },
        ],
        customCategories: [],
        products: [],
        categoryPreferences: {},
        categoryOrder: [],
      }
      expect(backup.validateBackup(old).valid).toBe(true)
      await expect(backup.importBackup(old)).resolves.toBeUndefined()
    })
  })
})
