import type { ShoppingItem } from '@/db'

/**
 * Agrupa os itens por departamento, na ordem de departamentos informada.
 * Dentro de cada departamento, os itens riscados descem para o fim; entre os
 * não riscados e entre os riscados vale a ordem de entrada (addedAt).
 * Não altera a lista original nem o banco.
 */
export function groupItemsByCategory(
  items: ShoppingItem[],
  sortedCategoryIds: string[],
): Record<string, ShoppingItem[]> {
  const grouped: Record<string, ShoppingItem[]> = {}

  for (const item of items) {
    ;(grouped[item.category] ??= []).push(item)
  }

  for (const list of Object.values(grouped)) {
    list.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1
      return a.addedAt - b.addedAt
    })
  }

  const ordered: Record<string, ShoppingItem[]> = {}
  for (const id of sortedCategoryIds) {
    if (grouped[id]) ordered[id] = grouped[id]
  }
  return ordered
}
