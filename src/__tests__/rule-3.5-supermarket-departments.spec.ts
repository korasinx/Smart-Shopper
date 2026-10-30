import { describe, it, expect } from 'vitest'
import { categorizeItem, parseItemsFromText } from '@/utils/categorization'

describe('Rule 3.5: Departamentos do supermercado brasileiro', () => {
  it('separa a lista falada em casa nos departamentos certos', () => {
    const falado =
      'trigo, arroz, açúcar, pipoca, ovo, azeite, margarina, sardinha, repolho, carne moída, detergente, laranja'
    const esperado: Record<string, string> = {
      trigo: 'pantry',
      arroz: 'pantry',
      açúcar: 'pantry',
      pipoca: 'snacks',
      ovo: 'dairy',
      azeite: 'pantry',
      margarina: 'dairy',
      sardinha: 'pantry',
      repolho: 'produce',
      'carne moída': 'meat',
      detergente: 'household',
      laranja: 'produce',
    }
    const itens = parseItemsFromText(falado)
    expect(itens).toEqual(Object.keys(esperado))
    for (const item of itens) {
      expect(categorizeItem(item), item).toBe(esperado[item])
    }
  })

  it.each([
    // enlatados de peixe vão para a mercearia; peixe fresco continua em carnes
    ['trigo', 'pantry'],
    ['sardinha', 'pantry'],
    ['sardinhas', 'pantry'],
    ['sardinha em lata', 'pantry'],
    ['sardinha lata', 'pantry'],
    ['sardinha fresca', 'meat'],
    ['atum', 'pantry'],
    ['atum em lata', 'pantry'],
    ['atum fresco', 'meat'],
    ['salmão', 'meat'],
    // mercearia
    ['fubá', 'pantry'],
    ['polvilho', 'pantry'],
    ['aveia', 'pantry'],
    ['granola', 'pantry'],
    ['extrato de tomate', 'pantry'],
    ['maionese', 'pantry'],
    ['ketchup', 'pantry'],
    ['mostarda', 'pantry'],
    ['gelatina', 'pantry'],
    ['fermento', 'pantry'],
    ['achocolatado', 'pantry'],
    // laticínios e frios
    ['creme de leite', 'dairy'],
    ['leite condensado', 'dairy'],
    ['leite em pó', 'dairy'],
    ['ricota', 'dairy'],
    ['cream cheese', 'dairy'],
    ['mortadela', 'dairy'],
    ['salame', 'dairy'],
    // bebidas
    ['chá', 'beverages'],
    ['erva-mate', 'beverages'],
    // lanches
    ['bolacha recheada', 'snacks'],
    ['salgadinho', 'snacks'],
    ['amendoim', 'snacks'],
    // congelados
    ['pão de queijo congelado', 'frozen'],
    ['lasanha congelada', 'frozen'],
    ['sorvete', 'frozen'],
    // carnes
    ['coxa de frango', 'meat'],
    ['bisteca', 'meat'],
    ['bacon', 'meat'],
    // hortifrúti
    ['chuchu', 'produce'],
    ['abobrinha', 'produce'],
    ['mandioca', 'produce'],
    ['beterraba', 'produce'],
    ['cenoura', 'produce'],
    ['couve', 'produce'],
    ['cheiro-verde', 'produce'],
    ['limão', 'produce'],
    ['mamão', 'produce'],
    ['abacaxi', 'produce'],
    ['melancia', 'produce'],
    ['uva', 'produce'],
    // limpeza, casa e higiene (sem categoria própria, vão para casa)
    ['esponja', 'household'],
    ['desinfetante', 'household'],
    ['lustra-móveis', 'household'],
    ['saco de lixo', 'household'],
    ['pasta de dente', 'household'],
    ['sabonete', 'household'],
    ['shampoo', 'household'],
    ['fralda', 'household'],
    ['ração', 'household'],
  ])('categoriza "%s" como %s', (name, expected) => {
    expect(categorizeItem(name)).toBe(expected)
  })
})
