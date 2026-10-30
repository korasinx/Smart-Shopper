<script setup lang="ts">
import { ref } from 'vue'
import { BaseCard, BaseButton, ConfirmDialog } from '@/components'
import { useBackup } from '@/composables/useBackup'
import { useToastNotifications } from '@/composables/useToastNotifications'

const { downloadBackup, importBackupFromFile } = useBackup()
const toastStore = useToastNotifications()

const exporting = ref(false)
const importing = ref(false)
const showConfirm = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)

const handleExportBackup = async () => {
  try {
    exporting.value = true
    await downloadBackup()
    toastStore.showSuccess('Backup exportado com sucesso!')
  } catch (error) {
    console.error('Failed to export backup:', error)
    toastStore.showError('Não foi possível exportar o backup')
  } finally {
    exporting.value = false
  }
}

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    selectedFile.value = file
    showConfirm.value = true
  }
}

const handleConfirmImport = async () => {
  if (!selectedFile.value) return

  try {
    importing.value = true
    await importBackupFromFile(selectedFile.value, { merge: false })
    toastStore.showSuccess('Backup importado com sucesso!')

    // Clear the file input
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }
    selectedFile.value = null

    // Reload the page to reflect the restored data
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  } catch (error) {
    console.error('Failed to import backup:', error)
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Não foi possível importar o backup. Confira o arquivo.'
    toastStore.showError(errorMessage)

    // Clear the file input on error too
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }
    selectedFile.value = null
  } finally {
    importing.value = false
  }
}
</script>

<template>
  <BaseCard class="p-6">
    <h2 class="text-2xl font-bold text-gray-900 mb-4">💾 Backup e restauração</h2>
    <p class="text-gray-600 mb-6">
      Exporte suas listas, itens e configurações para um arquivo de backup. Você poderá restaurá-lo
      depois, se precisar recuperar seus dados.
    </p>

    <div class="space-y-4">
      <!-- Export Backup -->
      <div class="flex items-start gap-4">
        <div class="flex-1">
          <h3 class="font-semibold text-gray-900 mb-1">Exportar backup</h3>
          <p class="text-sm text-gray-600">
            Baixe todos os seus dados em um arquivo JSON. Inclui listas, itens, categorias
            personalizadas, produtos e preferências.
          </p>
        </div>
        <BaseButton @click="handleExportBackup" :disabled="exporting" variant="secondary">
          <span v-if="!exporting">📥 Exportar</span>
          <span v-else>⏳ Exportando...</span>
        </BaseButton>
      </div>

      <div class="border-t border-gray-200"></div>

      <!-- Import Backup -->
      <div class="flex items-start gap-4">
        <div class="flex-1">
          <h3 class="font-semibold text-gray-900 mb-1">Importar backup</h3>
          <p class="text-sm text-gray-600">
            Restaure os dados de um arquivo de backup. Isso substitui todos os seus dados atuais
            pelo conteúdo do backup.
          </p>
        </div>
        <div class="flex flex-col gap-2">
          <input
            ref="fileInputRef"
            type="file"
            accept=".json"
            @change="handleFileSelect"
            class="hidden"
          />
          <BaseButton @click="triggerFileInput" :disabled="importing" variant="secondary">
            <span v-if="!importing">📤 Importar</span>
            <span v-else>⏳ Importando...</span>
          </BaseButton>
        </div>
      </div>
    </div>
  </BaseCard>

  <!-- Confirmation Dialog -->
  <ConfirmDialog
    v-model="showConfirm"
    title="Importar backup?"
    message="Isso vai substituir todos os seus dados atuais pelo backup. Tem certeza de que deseja continuar?"
    confirm-text="Importar backup"
    cancel-text="Cancelar"
    @confirm="handleConfirmImport"
  />
</template>
