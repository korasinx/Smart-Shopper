<script setup lang="ts">
import type { ShoppingItem } from '@/db'
import { useCategoriesStore } from '@/stores/categories'
import { IconButton } from '@/components'
import PriceEditor from '@/components/PriceEditor.vue'
import { formatBRL } from '@/utils/money'

interface Props {
  categoryId: string
  items: ShoppingItem[]
  listColor?: string
}

withDefaults(defineProps<Props>(), {
  listColor: '#10b981',
})

const emit = defineEmits<{
  toggleItem: [id: string]
  deleteItem: [id: string]
  changeCategory: [itemId: string, newCategory: string]
  createCategory: []
  setPrice: [id: string, price: number | undefined]
}>()

const categoriesStore = useCategoriesStore()
</script>

<template>
  <div
    class="bg-white border-2 border-border rounded-2xl overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md"
  >
    <!-- Category Header -->
    <div
      class="flex justify-between items-center px-6 py-4 bg-background border-b-2 border-border max-md:px-4"
    >
      <h3 class="text-lg font-semibold text-text">
        {{ categoriesStore.getCategoryDisplay(categoryId) }}
      </h3>
      <span
        class="text-white px-2 py-1 rounded-full text-sm font-semibold min-w-[24px] text-center"
        :style="{ backgroundColor: listColor }"
      >
        {{ items.length }}
      </span>
    </div>

    <!-- Items List -->
    <div class="flex flex-col">
      <div
        v-for="item in items"
        :key="item.id"
        role="checkbox"
        :aria-checked="item.completed"
        :aria-label="item.name"
        tabindex="0"
        class="group flex items-center gap-4 max-md:gap-3 min-h-14 px-6 py-4 max-md:py-3 border-b border-border last:border-b-0 cursor-pointer select-none transition-all duration-200 hover:bg-background focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/50 max-md:px-4"
        :class="{ 'opacity-50': item.completed }"
        @click="emit('toggleItem', item.id)"
        @keydown.enter.self.prevent="emit('toggleItem', item.id)"
        @keydown.space.self.prevent="emit('toggleItem', item.id)"
      >
        <!-- Caixinha (só visual: quem risca é a linha inteira) -->
        <span
          aria-hidden="true"
          class="w-6 h-6 shrink-0 border-2 border-border rounded-md flex items-center justify-center transition-all duration-200 bg-white text-white font-bold"
          :style="{
            backgroundColor: item.completed ? listColor : 'white',
            borderColor: item.completed ? listColor : '',
          }"
        >
          <span :class="item.completed ? 'opacity-100' : 'opacity-0'">✓</span>
        </span>

        <!-- Item Info -->
        <div class="flex-1 min-w-0 flex flex-col gap-1">
          <span
            class="text-base text-text font-medium break-words"
            :class="{ 'line-through text-text-secondary': item.completed }"
          >
            {{ item.name }}
          </span>
          <span
            v-if="item.price !== undefined && item.quantity > 1"
            class="text-sm text-text-secondary"
          >
            {{ item.quantity }} × {{ formatBRL(item.price) }}
            <span v-if="item.unit">{{ item.unit }}</span>
          </span>
          <span v-else-if="item.quantity > 1" class="text-sm text-text-secondary">
            × {{ item.quantity }}
            <span v-if="item.unit">{{ item.unit }}</span>
          </span>

          <!-- Category Selector (pequeno, abaixo do nome, para caber no celular) -->
          <select
            :value="item.category"
            @click.stop
            @change="
              (e) => {
                const value = (e.target as HTMLSelectElement).value
                if (value === '__new__') {
                  emit('createCategory')
                } else {
                  emit('changeCategory', item.id, value)
                }
              }
            "
            class="self-start max-w-full -ml-1 px-1 py-0.5 text-xs text-text-secondary bg-transparent border border-transparent rounded-md cursor-pointer transition-all duration-200 hover:border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
            title="Mudar categoria"
          >
            <option v-for="cat in categoriesStore.allCategories" :key="cat.id" :value="cat.id">
              {{ cat.icon }} {{ cat.name }}
            </option>
            <option value="__new__" class="font-semibold">➕ Nova categoria...</option>
          </select>
        </div>

        <!-- Preço (opcional) -->
        <PriceEditor
          class="shrink-0"
          :price="item.price"
          :label="item.name"
          @save="(price) => emit('setPrice', item.id, price)"
        />

        <!-- Delete Button -->
        <IconButton
          variant="danger"
          icon="🗑️"
          title="Remover item"
          @click.stop="emit('deleteItem', item.id)"
          class="shrink-0 opacity-0 group-hover:opacity-100 max-md:opacity-100"
        />
      </div>
    </div>
  </div>
</template>
