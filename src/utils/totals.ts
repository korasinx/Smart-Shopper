import type { ShoppingItem } from '@/db'
import { roundMoney } from '@/utils/money'

export interface ListTotals {
  /** soma (preço × quantidade) dos itens riscados que têm preço */
  inCart: number
  /** soma (preço × quantidade) de todos os itens que têm preço */
  total: number
  /** quantos itens ainda não têm preço */
  withoutPrice: number
}

export function calculateTotals(items: ShoppingItem[]): ListTotals {
  let inCart = 0
  let total = 0
  let withoutPrice = 0

  for (const item of items) {
    if (typeof item.price !== 'number' || !Number.isFinite(item.price)) {
      withoutPrice++
      continue
    }
    const value = item.price * (item.quantity > 0 ? item.quantity : 1)
    total += value
    if (item.completed) inCart += value
  }

  return { inCart: roundMoney(inCart), total: roundMoney(total), withoutPrice }
}

export type BudgetLevel = 'normal' | 'warning' | 'over'

export interface BudgetStatus {
  level: BudgetLevel
  /** limite − no carrinho (negativo quando passou) */
  remaining: number
  /** quanto passou do limite (0 se não passou) */
  overBy: number
  /** percentual do limite já no carrinho, de 0 a 100 (para a barrinha) */
  percent: number
  /** a lista toda passa do limite, mas o carrinho ainda não */
  forecastOver: boolean
}

/**
 * Situação do gasto em relação ao limite. Sem limite (ou limite zero) devolve null.
 * Normal até 89% do limite; de 90% a 100% atenção; acima de 100% passou.
 */
export function getBudgetStatus(
  inCart: number,
  total: number,
  budget: number | undefined,
): BudgetStatus | null {
  if (typeof budget !== 'number' || !Number.isFinite(budget) || budget <= 0) return null

  const ratio = inCart / budget
  const level: BudgetLevel = inCart > budget ? 'over' : ratio >= 0.9 ? 'warning' : 'normal'

  return {
    level,
    remaining: roundMoney(budget - inCart),
    overBy: roundMoney(Math.max(0, inCart - budget)),
    percent: Math.min(100, Math.max(0, Math.round(ratio * 100))),
    forecastOver: total > budget && inCart <= budget,
  }
}
