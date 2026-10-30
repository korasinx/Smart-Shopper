const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

/** Arredonda para centavos (evita 0,1 × 3 = 0,30000000000000004) */
export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

/** Formata em reais: 12.9 -> "R$ 12,90" */
export function formatBRL(value: number): string {
  return brl.format(value)
}

export interface MoneyInputResult {
  valid: boolean
  value?: number
}

/**
 * Lê o que a pessoa digitou num campo de dinheiro.
 * Aceita "12,90", "12.90", "R$ 12,90" e "1.234,56". Vazio é válido e significa
 * "remover" (value undefined). Negativos, letras e mais de 2 casas são inválidos.
 */
export function parseMoneyInput(text: string): MoneyInputResult {
  let cleaned = text.replace(/R\$/gi, '').replace(/\s+/g, '')
  if (cleaned === '') return { valid: true, value: undefined }

  if (cleaned.includes(',')) {
    // vírgula é o decimal; pontos antes dela são separadores de milhar
    cleaned = cleaned.replace(/\./g, '').replace(',', '.')
  }

  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return { valid: false }
  return { valid: true, value: roundMoney(Number(cleaned)) }
}

/** Valor para preencher o campo ao editar: 12.9 -> "12,90" */
export function moneyToInput(value: number): string {
  return value.toFixed(2).replace('.', ',')
}
