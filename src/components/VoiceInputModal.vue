<script setup lang="ts">
import { computed, watch } from 'vue'
import { useSpeechRecognition } from '@/composables/useSpeechRecognition'
import { BaseDialog, BaseButton } from '@/components'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: [transcript: string]
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const { isListening, transcript, error, isSupported, startListening, stopListening, reset } =
  useSpeechRecognition()

// Auto-start listening when modal opens
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue && isSupported.value) {
      reset()
      // Small delay to let modal animation complete
      setTimeout(() => {
        startListening()
      }, 300)
    } else if (!newValue) {
      stopListening()
      reset()
    }
  },
)

const toggleListening = () => {
  if (isListening.value) {
    stopListening()
  } else {
    startListening()
  }
}

const retry = () => {
  reset()
  startListening()
}

const cancel = () => {
  stopListening()
  reset()
  isOpen.value = false
}

const confirm = () => {
  if (transcript.value.trim()) {
    emit('confirm', transcript.value.trim())
    reset()
    isOpen.value = false
  }
}
</script>

<template>
  <BaseDialog v-model="isOpen">
    <div class="flex flex-col items-center gap-6 p-6">
      <!-- Microphone Button -->
      <div class="relative">
        <button
          data-testid="voice-start-button"
          @click="toggleListening"
          :disabled="!isSupported"
          class="w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg"
          :class="{
            'bg-red-500 hover:bg-red-600 animate-pulse': isListening,
            'bg-primary hover:bg-primary-dark': !isListening && isSupported,
            'bg-gray-300 cursor-not-allowed': !isSupported,
          }"
          :title="isListening ? 'Parar de ouvir' : 'Começar a ouvir'"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-12 w-12 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
        </button>

        <!-- Listening Rings Animation -->
        <div
          v-if="isListening"
          class="absolute inset-0 rounded-full border-4 border-red-500 animate-ping opacity-75"
        ></div>
      </div>

      <!-- Status Text -->
      <div class="text-center">
        <p v-if="!isSupported" class="text-gray-600 font-medium">
          O reconhecimento de voz não é compatível com este navegador
        </p>
        <p v-else-if="isListening" class="text-gray-900 font-medium text-lg">
          Ouvindo... Pode falar
        </p>
        <p v-else class="text-gray-600 font-medium">Toque no microfone para começar</p>
      </div>

      <!-- Transcript Display -->
      <div v-if="transcript" class="w-full">
        <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <p class="text-sm text-gray-500 mb-2 font-medium">Texto reconhecido:</p>
          <p class="text-gray-900 text-lg">{{ transcript }}</p>
        </div>
      </div>

      <!-- Error Display -->
      <div v-if="error" class="w-full">
        <div class="bg-red-50 rounded-lg p-4 border border-red-200">
          <div class="flex items-start gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6 text-red-600 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div class="flex-1">
              <p class="text-sm font-medium text-red-900 mb-1">Erro</p>
              <p class="text-sm text-red-800">{{ error.message }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Instructions -->
      <div
        v-if="!error && !transcript && isSupported"
        class="w-full text-center text-sm text-gray-500"
      >
        <p>Experimente dizer:</p>
        <p class="mt-2 italic">"Leite e ovos"</p>
        <p class="italic">"Adicionar bananas, pão e queijo"</p>
        <p class="italic">"Tomates e alface"</p>
      </div>

      <!-- Action Buttons -->
      <div class="w-full flex gap-3 justify-end">
        <BaseButton v-if="error" @click="retry" variant="secondary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Tentar novamente
        </BaseButton>

        <BaseButton @click="cancel" variant="secondary"> Cancelar </BaseButton>

        <BaseButton
          v-if="transcript && !isListening"
          @click="confirm"
          variant="primary"
          :disabled="!transcript.trim()"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
          Adicionar itens
        </BaseButton>
      </div>
    </div>
  </BaseDialog>
</template>
