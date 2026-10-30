import { describe, it, expect } from 'vitest'
import { categorizeItem, parseItemsFromText } from '@/utils/categorization'
import { CATEGORIES } from '@/constants/categories'

describe('Rule 3.4: Categorização e entrada de texto em português', () => {
  describe('categorizeItem', () => {
    it.each([
      ['Leite', 'dairy'],
      ['queijo mussarela', 'dairy'],
      ['Presunto', 'dairy'],
      ['requeijão', 'dairy'],
      ['Iogurte natural', 'dairy'],
      ['creme de leite', 'dairy'],
      ['ovos', 'dairy'],
      ['pão francês', 'bakery'],
      ['Pão de forma', 'bakery'],
      ['pães', 'bakery'],
      ['pão de queijo', 'bakery'],
      ['bolo de cenoura', 'bakery'],
      ['Sabão em pó', 'household'],
      ['papel higiênico', 'household'],
      ['Amaciante', 'household'],
      ['água sanitária', 'household'],
      ['detergente', 'household'],
      ['pasta de dente', 'household'],
      ['feijão', 'pantry'],
      ['Arroz', 'pantry'],
      ['açúcar', 'pantry'],
      ['Café', 'pantry'],
      ['óleo de soja', 'pantry'],
      ['macarrão', 'pantry'],
      ['molho de tomate', 'pantry'],
      ['leite de coco', 'pantry'],
      ['Bananas', 'produce'],
      ['tomates', 'produce'],
      ['Cebola', 'produce'],
      ['alho', 'produce'],
      ['batata doce', 'produce'],
      ['limões', 'produce'],
      ['carne moída', 'meat'],
      ['Frango', 'meat'],
      ['picanha', 'meat'],
      ['linguiça', 'meat'],
      ['salsicha', 'meat'],
      ['refrigerante', 'beverages'],
      ['Cerveja', 'beverages'],
      ['suco de laranja', 'beverages'],
      ['água', 'beverages'],
      ['biscoito recheado', 'snacks'],
      ['Bolacha', 'snacks'],
      ['chocolate', 'snacks'],
      ['batata frita', 'snacks'],
      ['sorvete', 'frozen'],
      ['Pizza congelada', 'frozen'],
      ['frango congelado', 'frozen'],
    ])('categoriza "%s" como %s', (name, expected) => {
      expect(categorizeItem(name)).toBe(expected)
    })

    it('ignora acentos e maiúsculas', () => {
      expect(categorizeItem('PAO FRANCES')).toBe('bakery')
      expect(categorizeItem('feijao')).toBe('pantry')
      expect(categorizeItem('SABAO EM PO')).toBe('household')
      expect(categorizeItem('CAFÉ')).toBe('pantry')
    })

    it('não confunde palavras parecidas', () => {
      expect(categorizeItem('Salsicha')).toBe('meat') // não é "sal"
      expect(categorizeItem('Tomate')).toBe('produce') // não é "mate"
      expect(categorizeItem('Item desconhecido')).toBe('other')
    })

    it('mantém a preferência do usuário acima da categorização automática', () => {
      expect(categorizeItem('Leite', 'beverages')).toBe('beverages')
    })
  })

  describe('parseItemsFromText', () => {
    it('separa por vírgula e por "e"', () => {
      expect(parseItemsFromText('leite, pão e ovos')).toEqual(['leite', 'pão', 'ovos'])
    })

    it('remove prefixos de fala e artigos', () => {
      expect(parseItemsFromText('Adicionar bananas, pão e queijo')).toEqual([
        'bananas',
        'pão',
        'queijo',
      ])
      expect(parseItemsFromText('preciso de um café e uma manteiga')).toEqual(['café', 'manteiga'])
      expect(parseItemsFromText('Tomates e alface')).toEqual(['Tomates', 'alface'])
    })

    it('entende dúzia e embalagens', () => {
      expect(parseItemsFromText('uma dúzia de ovos')).toEqual(['ovos'])
      expect(parseItemsFromText('2 garrafas de leite e um pacote de arroz')).toEqual([
        'leite',
        'arroz',
      ])
      expect(parseItemsFromText('duas caixas de leite')).toEqual(['leite'])
    })
  })

  describe('CATEGORIES', () => {
    it('mantém os ids em inglês e os nomes em português', () => {
      expect(CATEGORIES.map((c) => c.id)).toEqual([
        'produce',
        'dairy',
        'meat',
        'bakery',
        'frozen',
        'pantry',
        'beverages',
        'snacks',
        'household',
        'other',
      ])
      expect(CATEGORIES.map((c) => c.name)).toEqual([
        'Hortifrúti',
        'Laticínios e frios',
        'Carnes e peixes',
        'Padaria',
        'Congelados',
        'Mercearia',
        'Bebidas',
        'Lanches e doces',
        'Limpeza e casa',
        'Outros',
      ])
    })
  })
})
