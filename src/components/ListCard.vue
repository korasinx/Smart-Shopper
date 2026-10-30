<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ShoppingList } from '@/db'
import { DEFAULT_LIST_COLOR } from '@/utils/colors'
import IconButton from './IconButton.vue'

interface Props {
  list: ShoppingList
  totalItems: number
  completedItems: number
  variant?: 'active' | 'archived'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'active',
})

const emit = defineEmits<{
  click: []
  duplicate: []
  archive: []
  unarchive: []
  delete: []
}>()

const isHovering = ref(false)

const progressPercentage = computed(() => {
  if (props.totalItems === 0) return 0
  return Math.round((props.completedItems / props.totalItems) * 100)
})

const listColor = computed(() => props.list.color || DEFAULT_LIST_COLOR)

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString('pt-BR')
}
</script>

<template>
  <div
    class="group bg-white border-2 rounded-2xl p-6 cursor-pointer transition-all duration-200 flex flex-col gap-4 relative overflow-hidden shadow-sm"
    :class="{
      'hover:-translate-y-1 hover:shadow-lg': variant === 'active',
      'opacity-70 hover:opacity-100 hover:shadow-md': variant === 'archived',
    }"
    :style="{
      borderColor: variant === 'active' && isHovering ? listColor : 'var(--color-border)',
    }"
    @mouseenter="isHovering = true"
    @mouseleave="isHovering = false"
    @click="emit('click')"
  >
    <!-- Card Header -->
    <div class="flex justify-between items-start gap-2">
      <h3 class="text-xl font-semibold text-text flex-1 wrap-break-word">
        {{ list.name }}
      </h3>
      <div
        class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity max-md:opacity-100"
      >
        <IconButton
          v-if="variant === 'active'"
          icon="📋"
          title="Duplicar"
          @click.stop="emit('duplicate')"
        />
        <IconButton
          v-if="variant === 'active'"
          icon="📦"
          title="Arquivar"
          @click.stop="emit('archive')"
        />
        <IconButton
          v-if="variant === 'archived'"
          icon="↩️"
          title="Desarquivar"
          @click.stop="emit('unarchive')"
        />
        <IconButton icon="🗑️" title="Excluir" variant="danger" @click.stop="emit('delete')" />
      </div>
    </div>

    <!-- Card Stats (Active only) -->
    <div v-if="variant === 'active'" class="flex items-center gap-4 p-4 bg-background rounded-xl">
      <div class="flex items-center gap-2 flex-1">
        <div class="text-2xl">✓</div>
        <div class="flex flex-col gap-0.5">
          <span class="text-xl font-bold text-text leading-none">
            {{ completedItems }}
          </span>
          <span class="text-xs text-text-secondary uppercase tracking-wide"> concluídos </span>
        </div>
      </div>
      <div class="w-px h-8 bg-border"></div>
      <div class="flex items-center gap-2 flex-1">
        <div class="text-2xl">📝</div>
        <div class="flex flex-col gap-0.5">
          <span class="text-xl font-bold text-text leading-none">
            {{ totalItems }}
          </span>
          <span class="text-xs text-text-secondary uppercase tracking-wide"> itens no total </span>
        </div>
      </div>
    </div>

    <!-- Card Footer -->
    <div class="flex items-center text-sm">
      <span class="text-text-secondary">
        <span class="mr-1">🕒</span>
        {{ variant === 'active' ? 'Atualizada em' : 'Arquivada em' }}
        {{ formatDate(list.updatedAt) }}
      </span>
    </div>

    <!-- Progress Bar (Active only) -->
    <div
      v-if="variant === 'active'"
      class="absolute bottom-0 left-0 right-0 h-1 bg-border rounded-b-2xl overflow-hidden"
    >
      <div
        class="h-full transition-all duration-300"
        :style="{
          width: `${progressPercentage}%`,
          backgroundColor: listColor,
        }"
      ></div>
    </div>
  </div>
</template>
