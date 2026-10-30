<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import type { ShoppingItem } from '@/db'
import { useToastNotifications } from '@/composables/useToastNotifications'
import { formatBRL, moneyToInput, parseMoneyInput } from '@/utils/money'
import { calculateTotals, getBudgetStatus } from '@/utils/totals'

interface Props {
  items: ShoppingItem[]
  budget?: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  setBudget: [budget: number | undefined]
}>()

const toastStore = useToastNotifications()

const totals = computed(() => calculateTotals(props.items))
const status = computed(() =>
  getBudgetStatus(totals.value.inCart, totals.value.total, props.budget),
)

const levelStyles = {
  normal: 'bg-white border-border text-text',
  warning: 'bg-[color-mix(in_srgb,var(--color-warning)_12%,white)] border-warning text-text',
  over: 'bg-[color-mix(in_srgb,var(--color-error)_10%,white)] border-error text-text',
}
const barStyles = { normal: 'bg-success', warning: 'bg-warning', over: 'bg-error' }

// Aviso só quando o carrinho cruza o limite de dentro para fora
const isOver = computed(() => status.value?.level === 'over')
watch(isOver, (now, before) => {
  if (!now || before || props.budget === undefined) return
  navigator.vibrate?.(200)
  toastStore.showToast(`Você passou do limite de ${formatBRL(props.budget)}`, 'error', 5000)
})

// Edição do limite
const editing = ref(false)
const draft = ref('')
const invalid = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)

const startEditing = async () => {
  draft.value = props.budget === undefined ? '' : moneyToInput(props.budget)
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
  // limite vazio ou zero = sem limite
  const next = result.value && result.value > 0 ? result.value : undefined
  if (next !== props.budget) emit('setBudget', next)
}
</script>

<template>
  <div
    class="sticky bottom-0 z-20 mt-4 -mx-4 md:mx-0 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] border-t-2 md:border-2 md:rounded-2xl shadow-[0_-4px_12px_rgba(0,0,0,0.08)] transition-colors duration-200"
    :class="status ? levelStyles[status.level] : levelStyles.normal"
    :data-level="status?.level"
  >
    <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
      <div class="flex flex-col">
        <span class="text-lg font-bold">No carrinho: {{ formatBRL(totals.inCart) }}</span>
        <span class="text-sm text-text-secondary">
          Total da lista: {{ formatBRL(totals.total) }}
        </span>
      </div>

      <div>
        <input
          v-if="editing"
          ref="inputRef"
          v-model="draft"
          data-testid="budget-input"
          type="text"
          inputmode="decimal"
          aria-label="Limite de gasto da lista"
          :aria-invalid="invalid"
          placeholder="0,00"
          class="w-28 px-2 py-2 text-sm text-right bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          :class="invalid ? 'border-error' : 'border-border'"
          @keydown.enter.prevent="commit(false)"
          @keydown.esc.prevent="cancel"
          @blur="commit(true)"
        />
        <button
          v-else
          type="button"
          data-testid="budget-button"
          class="min-h-10 px-3 text-sm font-semibold rounded-lg border border-border bg-white cursor-pointer transition-all duration-200 hover:bg-background"
          @click="startEditing"
        >
          {{ budget === undefined ? 'Definir limite' : `Limite: ${formatBRL(budget)}` }}
        </button>
      </div>
    </div>

    <template v-if="status">
      <div
        class="mt-2 h-2 w-full overflow-hidden rounded-full bg-border"
        role="progressbar"
        aria-label="Quanto do limite já foi gasto"
        aria-valuemin="0"
        aria-valuemax="100"
        :aria-valuenow="status.percent"
      >
        <div
          class="h-full rounded-full transition-all duration-300"
          :class="barStyles[status.level]"
          :style="{ width: `${status.percent}%` }"
        ></div>
      </div>
      <p class="mt-1 text-sm font-semibold">
        <template v-if="status.level === 'over'">
          Passou {{ formatBRL(status.overBy) }} do limite
        </template>
        <template v-else>
          Restam {{ formatBRL(status.remaining) }}
          <span v-if="status.level === 'warning'"> · Perto do limite</span>
        </template>
      </p>
      <p v-if="status.forecastOver" class="text-xs text-text-secondary">
        A lista toda dá {{ formatBRL(totals.total) }}, acima do limite
      </p>
    </template>

    <p v-if="totals.withoutPrice > 0" class="text-xs text-text-secondary">
      {{ totals.withoutPrice }}
      {{ totals.withoutPrice === 1 ? 'item sem preço' : 'itens sem preço' }}
    </p>
  </div>
</template>
