<script setup lang="ts">
const { data, state } = useConfirmationDialog()
</script>

<template>
  <UModal v-model="state.visible">
    <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
      <h2 class="text-lg font-semibold">
        {{ data.title }}
      </h2>
      <p class="opacity-85">
        {{ data.description }}
      </p>

      <template #footer>
        <div class="flex flex-row justify-end space-x-2">
          <UButton
            label="Cancel"
            :color="data.danger ? 'primary' : 'gray'"
            @click="state.visible = false"
          />
          <UButton
            label="Confirm"
            :color="data.danger ? 'gray' : 'primary'"
            :loading="state.pending"
            @click="data.onConfirm?.(() => (state.visible = false), (value) => state.pending = value)"
          />
        </div>
      </template>
    </UCard>
  </UModal>
</template>
