<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { formatBRL, moneyToInput, parseMoneyInput } from '@/utils/money'

interface Props {
  price?: number
  label?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  save: [price: number | undefined]
}>()

const editing = ref(false)
const draft = ref('')
const invalid = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)

const startEditing = async () => {
  draft.value = props.price === undefined ? '' : moneyToInput(props.price)
  invalid.value = false
  editing.value = true
  await nextTick()
  inputRef.value?.focus()
  inputRef.value?.select()
}

const cancel = () => {
  editing.value = false
  invalid.value = false
}

// Enter tenta salvar (inválido continua aberto); sair do campo salva ou descarta
const commit = (closeIfInvalid: boolean) => {
  if (!editing.value) return
  const result = parseMoneyInput(draft.value)
  if (!result.valid) {
    invalid.value = true
    if (closeIfInvalid) cancel()
    return
  }
  editing.value = false
  invalid.value = false
  if (result.value !== props.price) emit('save', result.value)
}
</script>

<template>
  <div class="shrink-0" @click.stop>
    <input
      v-if="editing"
      ref="inputRef"
      v-model="draft"
      data-testid="price-input"
      type="text"
      inputmode="decimal"
      :aria-label="`Preço de ${label ?? 'item'}`"
      :aria-invalid="invalid"
      placeholder="0,00"
      class="w-24 px-2 py-1.5 text-sm text-right bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
      :class="invalid ? 'border-error' : 'border-border'"
      @keydown.enter.prevent="commit(false)"
      @keydown.esc.prevent="cancel"
      @blur="commit(true)"
    />
    <button
      v-else
      type="button"
      data-testid="price-button"
      :title="price === undefined ? 'Informar preço' : 'Mudar preço'"
      class="min-h-9 px-2 text-sm font-medium rounded-lg border border-border cursor-pointer transition-all duration-200 hover:bg-background"
      :class="price === undefined ? 'text-text-secondary' : 'text-text'"
      @click="startEditing"
    >
      {{ price === undefined ? 'R$ —' : formatBRL(price) }}
    </button>
  </div>
</template>
