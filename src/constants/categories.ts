/**
 * Category definitions with icons and display names
 * This file centralizes category configuration for easy editing and future expansion
 */

export interface Category {
  id: string
  name: string
  icon: string
  sortOrder?: number
}

/**
 * All available shopping categories
 * Add or modify categories here to update them throughout the app
 */
export const CATEGORIES: Category[] = [
  { id: 'produce', name: 'Hortifrúti', icon: '🥬', sortOrder: 1 },
  { id: 'dairy', name: 'Laticínios e frios', icon: '🥛', sortOrder: 2 },
  { id: 'meat', name: 'Carnes e peixes', icon: '🥩', sortOrder: 3 },
  { id: 'bakery', name: 'Padaria', icon: '🍞', sortOrder: 4 },
  { id: 'frozen', name: 'Congelados', icon: '🧊', sortOrder: 5 },
  { id: 'pantry', name: 'Mercearia', icon: '🥫', sortOrder: 6 },
  { id: 'beverages', name: 'Bebidas', icon: '🥤', sortOrder: 7 },
  { id: 'snacks', name: 'Lanches e doces', icon: '🍪', sortOrder: 8 },
  { id: 'household', name: 'Limpeza e casa', icon: '🧹', sortOrder: 9 },
  { id: 'other', name: 'Outros', icon: '📦', sortOrder: 10 },
]

/**
 * Category lookup map for quick access by ID
 */
export const CATEGORY_MAP = CATEGORIES.reduce(
  (acc, cat) => {
    acc[cat.id] = cat
    return acc
  },
  {} as Record<string, Category>,
)

/**
 * Get formatted category display name with icon
 */
export const getCategoryDisplay = (categoryId: string): string => {
  const category = CATEGORY_MAP[categoryId] ?? CATEGORY_MAP.other!
  return `${category.icon} ${category.name}`
}

/**
 * Get category object by ID
 */
export const getCategory = (categoryId: string): Category => {
  return CATEGORY_MAP[categoryId] ?? CATEGORY_MAP.other!
}
