/**
 * Auto-categorization utility
 * Maps item names to categories based on keywords (Brazilian Portuguese + some English)
 */

const categoryKeywords: Record<string, string[]> = {
  produce: [
    // Frutas
    'banana',
    'maçã',
    'laranja',
    'limão',
    'uva',
    'morango',
    'abacate',
    'abacaxi',
    'mamão',
    'melancia',
    'melão',
    'manga',
    'pera',
    'mexerica',
    'tangerina',
    'kiwi',
    'goiaba',
    'maracujá',
    'ameixa',
    'pêssego',
    'caqui',
    'coco',
    'fruta',
    // Legumes e verduras
    'tomate',
    'alface',
    'pepino',
    'cenoura',
    'batata',
    'batata doce',
    'cebola',
    'alho',
    'espinafre',
    'brócolis',
    'pimentão',
    'cogumelo',
    'champignon',
    'abobrinha',
    'abóbora',
    'couve',
    'couve-flor',
    'repolho',
    'beterraba',
    'rúcula',
    'agrião',
    'acelga',
    'chuchu',
    'mandioca',
    'aipim',
    'inhame',
    'berinjela',
    'quiabo',
    'vagem',
    'milho verde',
    'gengibre',
    'cheiro-verde',
    'salsinha',
    'cebolinha',
    'coentro',
    'manjericão',
    'hortelã',
    'salada',
    'legume',
    'verdura',
    // English
    'tomato',
    'orange',
    'lettuce',
    'cucumber',
    'carrot',
    'potato',
    'onion',
    'garlic',
    'apple',
    'grape',
    'berry',
    'lemon',
    'lime',
    'avocado',
    'spinach',
    'broccoli',
    'pepper',
    'mushroom',
    'fruit',
    'vegetable',
  ],
  dairy: [
    'leite',
    'queijo',
    'iogurte',
    'manteiga',
    'margarina',
    'creme de leite',
    'requeijão',
    'catupiry',
    'cream cheese',
    'mussarela',
    'muçarela',
    'queijo minas',
    'parmesão',
    'queijo prato',
    'provolone',
    'ricota',
    'cottage',
    'nata',
    'leite condensado',
    'leite em pó',
    'leite fermentado',
    'coalhada',
    'chantilly',
    'ovo',
    'presunto',
    'apresuntado',
    'peito de peru',
    'mortadela',
    'salame',
    // English
    'milk',
    'cheese',
    'yogurt',
    'butter',
    'cream',
    'eggs',
    'ice cream',
    'sour cream',
    'cottage cheese',
    'mozzarella',
    'cheddar',
    'parmesan',
  ],
  meat: [
    'carne',
    'carne moída',
    'frango',
    'peito de frango',
    'coxa',
    'sobrecoxa',
    'picanha',
    'alcatra',
    'contrafilé',
    'filé mignon',
    'acém',
    'patinho',
    'coxão mole',
    'costela',
    'linguiça',
    'salsicha',
    'bacon',
    'toucinho',
    'pernil',
    'lombo',
    'bisteca',
    'carne seca',
    'charque',
    'calabresa',
    'hambúrguer',
    'peixe',
    'tilápia',
    'salmão',
    'atum',
    'sardinha',
    'camarão',
    'bacalhau',
    'merluza',
    'peru',
    'fígado',
    'moela',
    // English
    'chicken',
    'beef',
    'pork',
    'fish',
    'salmon',
    'tuna',
    'shrimp',
    'turkey',
    'ham',
    'sausage',
    'steak',
    'ground beef',
    'lamb',
  ],
  bakery: [
    'pão',
    'pão francês',
    'pão de forma',
    'pão de queijo',
    'pão de leite',
    'pão integral',
    'pão doce',
    'pão sírio',
    'pão de hambúrguer',
    'pão de hot dog',
    'bisnaguinha',
    'bisnaga',
    'baguete',
    'croissant',
    'bolo',
    'rosca',
    'sonho',
    'torta',
    'broa',
    'cuca',
    'torrada',
    'pita',
    'pãozinho',
    // English
    'bread',
    'baguette',
    'roll',
    'bagel',
    'muffin',
    'cake',
    'pastry',
    'donut',
  ],
  frozen: [
    'congelado',
    'sorvete',
    'picolé',
    'açaí',
    'polpa de fruta',
    'pizza',
    'lasanha',
    'nuggets',
    'empanado',
    'gelo',
    'steak de frango',
    'mini pizza',
    // English
    'frozen',
    'popsicle',
    'frozen pizza',
    'frozen vegetables',
    'frozen meals',
  ],
  pantry: [
    'arroz',
    'feijão',
    'açúcar',
    'café',
    'óleo',
    'azeite',
    'macarrão',
    'espaguete',
    'massa',
    'farinha',
    'farinha de trigo',
    'farinha de mandioca',
    'farofa',
    'fubá',
    'amido de milho',
    'maisena',
    'sal',
    'vinagre',
    'molho',
    'molho de tomate',
    'extrato de tomate',
    'ketchup',
    'maionese',
    'mostarda',
    'shoyu',
    'milho',
    'ervilha',
    'atum em lata',
    'sardinha em lata',
    'azeitona',
    'palmito',
    'caldo',
    'tempero',
    'pimenta',
    'orégano',
    'colorau',
    'cominho',
    'canela',
    'aveia',
    'granola',
    'cereal',
    'sucrilhos',
    'leite de coco',
    'coco ralado',
    'tapioca',
    'polvilho',
    'fermento',
    'achocolatado',
    'chocolate em pó',
    'gelatina',
    'pudim',
    'lentilha',
    'grão de bico',
    'canjica',
    'miojo',
    'macarrão instantâneo',
    'mel',
    'geleia',
    'doce de leite',
    'manteiga de amendoim',
    'pasta de amendoim',
    'mistura para bolo',
    'sopa',
    // English
    'pasta',
    'rice',
    'flour',
    'sugar',
    'salt',
    'oil',
    'vinegar',
    'sauce',
    'can',
    'jar',
    'oatmeal',
    'beans',
    'soup',
    'tomato sauce',
  ],
  beverages: [
    'água',
    'água mineral',
    'água com gás',
    'água de coco',
    'água tônica',
    'refrigerante',
    'coca-cola',
    'guaraná',
    'fanta',
    'sprite',
    'pepsi',
    'suco',
    'néctar',
    'refresco',
    'cerveja',
    'chopp',
    'vinho',
    'vodka',
    'whisky',
    'cachaça',
    'espumante',
    'champagne',
    'gin',
    'energético',
    'isotônico',
    'chá',
    'mate',
    'kombucha',
    'cola',
    'bebida',
    // English
    'water',
    'juice',
    'soda',
    'coffee',
    'tea',
    'beer',
    'wine',
    'drink',
    'beverage',
  ],
  snacks: [
    'biscoito',
    'bolacha',
    'cream cracker',
    'wafer',
    'chocolate',
    'bombom',
    'barra de chocolate',
    'bala',
    'chiclete',
    'pirulito',
    'jujuba',
    'pipoca',
    'salgadinho',
    'batata frita',
    'batata palha',
    'amendoim',
    'castanha',
    'castanha de caju',
    'pistache',
    'nozes',
    'paçoca',
    'pé de moleque',
    'brigadeiro',
    'granulado',
    'goiabada',
    'barra de cereal',
    'doce',
    'ovo de páscoa',
    'sobremesa',
    // English
    'chips',
    'cookie',
    'candy',
    'popcorn',
    'crackers',
    'nuts',
    'pretzels',
    'snack',
  ],
  household: [
    'sabão em pó',
    'sabão líquido',
    'sabão',
    'detergente',
    'amaciante',
    'água sanitária',
    'água oxigenada',
    'desinfetante',
    'desengordurante',
    'multiuso',
    'limpa vidros',
    'esponja',
    'bucha',
    'palha de aço',
    'saco de lixo',
    'papel higiênico',
    'papel toalha',
    'guardanapo',
    'lenço de papel',
    'papel alumínio',
    'filme plástico',
    'pano de chão',
    'pano de prato',
    'vassoura',
    'rodo',
    'luva',
    'fósforo',
    'pilha',
    'lâmpada',
    'inseticida',
    'álcool',
    'cloro',
    'shampoo',
    'condicionador',
    'sabonete',
    'creme dental',
    'pasta de dente',
    'escova de dente',
    'fio dental',
    'enxaguante bucal',
    'desodorante',
    'absorvente',
    'fralda',
    'algodão',
    // English
    'soap',
    'toothpaste',
    'paper towel',
    'toilet paper',
    'cleaner',
    'dish soap',
    'trash bags',
    'tissue',
  ],
}

/**
 * Lowercase, strip accents and turn any punctuation into a single space
 * ("Pão-de-queijo" -> "pao de queijo")
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

/**
 * Regex source accepting a word and its simple plural forms
 * (tomate -> tomates, pão -> pães, papel -> papéis, item -> itens, berry -> berries)
 */
function wordWithPlurals(word: string): string {
  const forms = new Set([word, `${word}s`, `${word}es`])
  if (word.endsWith('ao')) {
    const stem = word.slice(0, -2)
    forms.add(`${stem}aes`)
    forms.add(`${stem}oes`)
    forms.add(`${stem}aos`)
  }
  if (word.endsWith('l')) forms.add(`${word.slice(0, -1)}is`)
  if (word.endsWith('m')) forms.add(`${word.slice(0, -1)}ns`)
  if (word.endsWith('y')) forms.add(`${word.slice(0, -1)}ies`)
  return `(?:${[...forms].join('|')})`
}

interface CompiledKeyword {
  category: string
  words: number
  length: number
  pattern: RegExp
}

const compiledKeywords: CompiledKeyword[] = Object.entries(categoryKeywords).flatMap(
  ([category, keywords]) =>
    keywords.map((keyword) => {
      const words = normalizeText(keyword).split(' ')
      return {
        category,
        words: words.length,
        length: words.join(' ').length,
        pattern: new RegExp(`(^| )${words.map(wordWithPlurals).join(' ')}(?= |$)`),
      }
    }),
)

// "congelado"/"frozen" describe the product no matter where they appear in the name
const frozenModifier = /(^| )(congelad[oa]s?|frozen)(?= |$)/

/**
 * Auto-categorize an item based on its name
 * Uses keyword matching to determine the best category: ignores case and accents,
 * accepts simple plurals and prefers the match that starts first in the name
 * (the main noun usually comes first in Portuguese: "suco de laranja", "molho de tomate"),
 * then the longest one ("água sanitária" beats "água").
 * @param itemName - The name of the item to categorize
 * @param preferredCategory - Optional user preference to override auto-categorization
 * @returns The category ID
 */
export function categorizeItem(itemName: string, preferredCategory?: string | null): string {
  // Use preferred category if provided
  if (preferredCategory) {
    return preferredCategory
  }

  // Fall back to keyword matching
  const normalized = normalizeText(itemName)
  if (!normalized) return 'other'

  if (frozenModifier.test(normalized)) return 'frozen'

  let best: { category: string; start: number; words: number; length: number } | null = null

  for (const keyword of compiledKeywords) {
    const match = keyword.pattern.exec(normalized)
    if (!match) continue

    const start = match.index + (match[1]?.length ?? 0)
    if (
      !best ||
      start < best.start ||
      (start === best.start &&
        (keyword.words > best.words ||
          (keyword.words === best.words && keyword.length > best.length)))
    ) {
      best = { category: keyword.category, start, words: keyword.words, length: keyword.length }
    }
  }

  return best?.category ?? 'other'
}

/**
 * Parse a text input into multiple items
 * Supports comma-separated, "e"/"and"-separated, and line-separated items
 * Also handles natural language patterns like "adicionar X", "preciso de X", "uma dúzia de X"
 * @param input - The text to parse
 * @returns Array of item names
 */
export function parseItemsFromText(input: string): string[] {
  if (!input.trim()) return []

  let processedInput = input

  // Handle patterns like "uma dúzia de ovos" / "a dozen eggs" -> "ovos" (before splitting)
  processedInput = processedInput.replace(/\b(a\s+)?dozen\s+/gi, '')
  processedInput = processedInput.replace(/(^|\s)(?:uma\s+|meia\s+)?d[uú]zia\s+(?:de\s+)?/gi, '$1')

  // Handle patterns like "2 bottles of milk" -> "milk" (before splitting)
  processedInput = processedInput.replace(
    /\b\d+\s+(bottles?|cans?|boxes?|bags?|jars?)\s+of\s+/gi,
    '',
  )

  // Handle patterns like "a bottle of milk" -> "milk" (before splitting)
  processedInput = processedInput.replace(/\b(a|an|the)\s+(bottle|can|box|bag|jar)\s+of\s+/gi, '')

  // Handle patterns like "2 garrafas de leite" / "um pacote de arroz" -> "leite" / "arroz"
  processedInput = processedInput.replace(
    /(^|[\s,])(?:\d+|um|uma|dois|duas|tr[eê]s|quatro|cinco|seis|sete|oito|nove|dez)\s+(?:garrafas?|latas?|caixas?|pacotes?|sacos?|potes?|vidros?|frascos?|litros?|quilos?|kg)\s+de\s+/gi,
    '$1',
  )

  // Split by commas, newlines, "e" or "and"
  const items = processedInput
    .split(/[,\n]|(?:\s+(?:e|and)\s+)/gi)
    .map((item) => {
      let trimmed = item.trim()

      // Strip courtesy words and common voice input prefixes from each item (case insensitive)
      trimmed = trimmed.replace(/^(?:(?:please|por favor)\s+)+/gi, '')
      trimmed = trimmed.replace(
        /^(?:eu\s+)?(?:i need|i want|i'm getting|im getting|i'd like|id like|preciso de|preciso|quero|vou comprar|vou levar|gostaria de)\s+/gi,
        '',
      )
      trimmed = trimmed.replace(
        /^(?:add|get|buy|need|want|purchase|pick up|grab|adicionar|adicione|adiciona|colocar|coloque|coloca|comprar|compre|compra|pegar|pegue|pega|incluir|inclua|anotar|anote|botar|bota)\s+/gi,
        '',
      )

      // Strip leading articles and quantifiers from each item
      trimmed = trimmed.replace(
        /^(?:a|an|the|some|o|os|as|um|uma|uns|umas|algum|alguns|alguma|algumas)\s+/gi,
        '',
      )

      return trimmed
    })
    .filter((item) => item.length > 0)

  // Remove duplicates
  return [...new Set(items)]
}

/**
 * Sanitize item name
 * @param name - The item name to sanitize
 * @returns Sanitized name
 */
export function sanitizeItemName(name: string): string {
  return name.trim().replace(/\s+/g, ' ')
}
