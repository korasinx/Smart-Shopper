import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import CategorySection from '@/components/CategorySection.vue'
import { groupItemsByCategory } from '@/utils/items'
import type { ShoppingItem } from '@/db'

function makeItem(id: string, category: string, addedAt: number, completed = false): ShoppingItem {
  return { id, listId: 'l1', name: `Item ${id}`, quantity: 1, category, completed, addedAt }
}

describe('Rule 6.1: Tocar na linha risca o item e o riscado desce', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  const mountSection = (items: ShoppingItem[]) =>
    mount(CategorySection, { props: { categoryId: 'pantry', items } })

  it('tocar na linha emite toggleItem uma vez', async () => {
    const wrapper = mountSection([makeItem('a', 'pantry', 1)])
    await wrapper.find('[role="checkbox"]').trigger('click')
    expect(wrapper.emitted('toggleItem')).toEqual([['a']])
  })

  it('tocar no nome do item risca', async () => {
    const wrapper = mountSection([makeItem('a', 'pantry', 1)])
    await wrapper.find('[role="checkbox"] span.font-medium').trigger('click')
    expect(wrapper.emitted('toggleItem')).toEqual([['a']])
  })

  it('tocar na caixinha risca uma vez só', async () => {
    const wrapper = mountSection([makeItem('a', 'pantry', 1)])
    // a caixinha é só visual: o clique sobe para a linha e dispara um único toggleItem
    await wrapper.find('span[aria-hidden="true"]').trigger('click')
    expect(wrapper.emitted('toggleItem')).toEqual([['a']])
    expect(wrapper.find('input').exists()).toBe(false)
  })

  it('a linha expõe role=checkbox, aria-checked e foco por teclado', () => {
    const wrapper = mountSection([makeItem('a', 'pantry', 1), makeItem('b', 'pantry', 2, true)])
    const rows = wrapper.findAll('[role="checkbox"]')
    expect(rows).toHaveLength(2)
    expect(rows[0]!.attributes('aria-checked')).toBe('false')
    expect(rows[1]!.attributes('aria-checked')).toBe('true')
    expect(rows[0]!.attributes('tabindex')).toBe('0')
    expect(rows[0]!.classes()).toContain('cursor-pointer')
  })

  it('Enter e Espaço riscam; teclas dentro do select não', async () => {
    const wrapper = mountSection([makeItem('a', 'pantry', 1)])
    const row = wrapper.find('[role="checkbox"]')
    await row.trigger('keydown', { key: 'Enter' })
    await row.trigger('keydown', { key: ' ' })
    expect(wrapper.emitted('toggleItem')).toHaveLength(2)
    await wrapper.find('select').trigger('keydown', { key: 'Enter' })
    await wrapper.find('select').trigger('keydown', { key: ' ' })
    expect(wrapper.emitted('toggleItem')).toHaveLength(2)
  })

  it('select de categoria e botão de excluir não riscam', async () => {
    const wrapper = mountSection([makeItem('a', 'pantry', 1)])
    await wrapper.find('select').trigger('click')
    await wrapper.find('button[title="Remover item"]').trigger('click')
    expect(wrapper.emitted('toggleItem')).toBeUndefined()
    expect(wrapper.emitted('deleteItem')).toEqual([['a']])
  })

  describe('groupItemsByCategory', () => {
    const order = ['produce', 'pantry', 'other']

    it('riscado desce para o fim do departamento, mantendo a ordem de entrada', () => {
      const items = [
        makeItem('1', 'pantry', 10, true),
        makeItem('2', 'pantry', 20),
        makeItem('3', 'pantry', 30, true),
        makeItem('4', 'pantry', 40),
        makeItem('5', 'produce', 5),
      ]
      const grouped = groupItemsByCategory(items, order)
      expect(Object.keys(grouped)).toEqual(['produce', 'pantry'])
      expect(grouped.pantry!.map((i) => i.id)).toEqual(['2', '4', '1', '3'])
    })

    it('desriscar devolve o item ao seu lugar de entrada, sem alterar o original', () => {
      const items = [makeItem('1', 'pantry', 10), makeItem('2', 'pantry', 20, true)]
      const before = items.map((i) => i.id)
      expect(groupItemsByCategory(items, order).pantry!.map((i) => i.id)).toEqual(['1', '2'])
      items[1]!.completed = false
      items[0]!.completed = true
      expect(groupItemsByCategory(items, order).pantry!.map((i) => i.id)).toEqual(['2', '1'])
      expect(items.map((i) => i.id)).toEqual(before)
    })
  })
})
