<script setup lang="ts">
const schema = z.object({
  type: z.enum(['ed25519', 'rsa']),
  rsaModulusLength: z.union([z.literal(1024), z.literal(2048), z.literal(3072), z.literal(4096)]).optional(),
  encoding: z.object({
    public: z.object({
      type: z.enum(['pkcs1', 'spki']).default('spki'),
      format: z.enum(['pem']).default('pem'),
    }),
    private: z.object({
      type: z.enum(['pkcs1', 'pkcs8']).default('pkcs8'),
      format: z.enum(['pem']).default('pem'),
      // cipher: z.enum(['aes-128-cbc', 'aes-256-cbc']).optional(),
      passphrase: z.string().optional(),
    }),
  }),
})
type Schema = zType.output<typeof schema>
const state = reactive<zType.infer<typeof schema>>({
  type: 'ed25519',
  rsaModulusLength: undefined,
  encoding: {
    public: {
      format: 'pem',
      type: 'spki',
    },
    private: {
      format: 'pem',
      type: 'pkcs8',
      passphrase: '',
    },
  },
})

function reset() {
  Object.assign(state, {
    type: 'ed25519',
    rsaModulusLength: undefined,
    encoding: {
      public: {
        format: 'pem',
        type: 'spki',
      },
      private: {
        format: 'pem',
        type: 'pkcs8',
        passphrase: '',
      },
    },
  })
}

const typeOptions = computed(() => {
  return [
    { label: 'Ed25519', value: 'ed25519' },
    { label: 'RSA', value: 'rsa' },
  ]
})
const rsaModulusLengthOptions = computed(() => {
  return [
    { label: '1024', value: 1024 },
    { label: '2048', value: 2048 },
    { label: '3072', value: 3072 },
    { label: '4096', value: 4096 },
  ]
})
const publicEncodingFormatOptions = computed(() => {
  return [
    { label: 'PEM', value: 'pem' },
  ]
})
const publicEncodingTypeOptions = computed(() => {
  return [
    { label: 'PKCS#1', value: 'pkcs1', disabled: state.type !== 'rsa' },
    { label: 'SPKI', value: 'spki', disabled: false },
  ]
})
const privateEncodingFormatOptions = computed(() => {
  return [
    { label: 'PEM', value: 'pem' },
  ]
})
const privateEncodingTypeOptions = computed(() => {
  return [
    { label: 'PKCS#1', value: 'pkcs1', disabled: state.type !== 'rsa' },
    { label: 'PKCS#8', value: 'pkcs8', disabled: false },
  ]
})

watch(() => state.type, (value) => {
  if (value === 'rsa')
    if (state.rsaModulusLength === undefined) state.rsaModulusLength = 2048

  if (value === 'ed25519') {
    if (state.rsaModulusLength) state.rsaModulusLength = undefined
    if (state.encoding.public.type === 'pkcs1') state.encoding.public.type = 'spki'
    if (state.encoding.private.type === 'pkcs1') state.encoding.private.type = 'pkcs8'
  }
})

const result = ref<{
  publicKey: string
  privateKey: string
  privateKeyCipher: 'aes-128-cbc' | 'aes-256-cbc' | null
} | null>(null)

const toast = useToast()
const formPending = ref(false)
async function onSubmit(event: FormSubmitEvent<Schema>) {
  formPending.value = true
  if (typeof event.data.encoding.private.passphrase === 'string') {
    if (event.data.encoding.private.passphrase.length === 0)
      event.data.encoding.private.passphrase = undefined
  }

  try {
    const response = await $fetch('/api/keys/generate', {
      method: 'POST',
      body: event.data,
    })
    result.value = response
  }
  catch (error) {
    if (error instanceof Error) {
      toast.add({
        color: 'red',
        title: 'Error',
        description: error.message,
      })
    }
    else {
      toast.add({
        color: 'red',
        title: 'Error',
        description: 'Something went wrong',
      })
    }
  }

  formPending.value = false
  reset()
}

const { copy, isSupported } = useClipboard()
const copyResult = {
  publicKey: () => {
    if (!result.value) return
    copy(result.value.publicKey).then(() => {
      toast.add({
        color: 'green',
        title: 'Copied',
        description: 'Public key copied to clipboard',
      })
    })
  },
  privateKey: () => {
    if (!result.value) return
    copy(result.value.privateKey).then(() => {
      toast.add({
        color: 'green',
        title: 'Copied',
        description: 'Private key copied to clipboard',
      })
    })
  },
}
</script>

<template>
  <div class="flex-1 pt-0.5 flex flex-col">
    <div v-if="result">
      <span class="block font-medium text-gray-700 dark:text-gray-200 text-sm opacity-75 mb-1">Generated Key Pair</span>
      <div class="border-t border-gray-200/50 dark:border-gray-800/50 pt-2 flex flex-col space-y-4">
        <UFormGroup label="Public Key">
          <template v-if="isSupported" #hint>
            <UTooltip text="Copy to Clipboard">
              <UButton color="gray" icon="i-heroicons-clipboard-document" size="2xs" @click="copyResult.publicKey" />
            </UTooltip>
          </template>
          <UTextarea
            v-model="result.publicKey"
            disabled
            autoresize
            :ui="{ base: 'disabled:cursor-default disabled:opacity-100 font-mono' }"
          />
        </UFormGroup>
        <UFormGroup label="Private Key">
          <template v-if="isSupported" #hint>
            <UTooltip text="Copy to Clipboard">
              <UButton color="gray" icon="i-heroicons-clipboard-document" size="2xs" @click="copyResult.privateKey" />
            </UTooltip>
          </template>
          <UTextarea
            v-model="result.privateKey"
            disabled
            autoresize
            :ui="{ base: 'disabled:cursor-default disabled:opacity-100 font-mono' }"
          />
        </UFormGroup>
        <UFormGroup v-if="result.privateKeyCipher" label="Private Key Cipher">
          <UInput
            v-model="result.privateKeyCipher"
            disabled
            :ui="{ base: 'disabled:cursor-default disabled:opacity-100 font-mono' }"
          />
        </UFormGroup>

        <div class="flex flex-row justify-between space-x-2 pt-2">
          <div />
          <div class="flex flex-row justify-end space-x-2">
            <UButton variant="link" size="lg" color="gray" :padded="false" @click="result = null">
              Back to Form
            </UButton>
            <!-- <UButton variant="soft" size="lg">
              Save
            </UButton> -->
          </div>
        </div>
      </div>
    </div>

    <UForm v-else :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
      <div class="flex flex-row space-x-2">
        <UFormGroup label="Type" name="type" class="flex-1">
          <USelectMenu
            v-model="state.type"
            option-attribute="label"
            value-attribute="value"
            :options="typeOptions"
          >
            <template #label>
              <span class="truncate">{{ typeOptions.find(i => i.value === state.type)?.label }}</span>
            </template>
          </USelectMenu>
        </UFormGroup>

        <UFormGroup v-if="state.type === 'rsa'" label="RSA Modulus Length" name="rsaModulusLength">
          <USelectMenu
            v-model="state.rsaModulusLength"
            option-attribute="label"
            value-attribute="value"
            :options="rsaModulusLengthOptions"
          >
            <template #label>
              <span class="truncate">{{ rsaModulusLengthOptions.find(i => i.value === state.rsaModulusLength)?.label }}</span>
            </template>
          </USelectMenu>
        </UFormGroup>
      </div>

      <div>
        <span class="block font-medium text-gray-700 dark:text-gray-200 text-sm opacity-75 mb-1">Public Key Encoding</span>
        <div class="border-t border-gray-200/50 dark:border-gray-800/50 pt-2">
          <div class="flex flex-row space-x-2">
            <UFormGroup label="Format" name="encoding.public.format" class="flex-1">
              <USelectMenu
                v-model="state.encoding.public.format"
                option-attribute="label"
                value-attribute="value"
                :options="publicEncodingFormatOptions"
              >
                <template #label>
                  <span class="truncate">{{ publicEncodingFormatOptions.find(i => i.value === state.encoding.public.format)?.label }}</span>
                </template>
              </USelectMenu>
            </UFormGroup>

            <UFormGroup label="Type" name="encoding.public.type" class="flex-1">
              <USelectMenu
                v-model="state.encoding.public.type"
                option-attribute="label"
                value-attribute="value"
                :options="publicEncodingTypeOptions"
              >
                <template #label>
                  <span class="truncate">{{ publicEncodingTypeOptions.find(i => i.value === state.encoding.public.type)?.label }}</span>
                </template>
              </USelectMenu>
            </UFormGroup>
          </div>
        </div>
      </div>

      <div>
        <span class="block font-medium text-gray-700 dark:text-gray-200 text-sm opacity-75 mb-1">Private Key Encoding</span>
        <div class="border-t border-gray-200/50 dark:border-gray-800/50 pt-2">
          <div class="flex flex-row space-x-2">
            <UFormGroup label="Format" name="encoding.private.format" class="flex-1">
              <USelectMenu
                v-model="state.encoding.private.format"
                option-attribute="label"
                value-attribute="value"
                :options="privateEncodingFormatOptions"
              >
                <template #label>
                  <span class="truncate">{{ privateEncodingFormatOptions.find(i => i.value === state.encoding.private.format)?.label }}</span>
                </template>
              </USelectMenu>
            </UFormGroup>

            <UFormGroup label="Type" name="encoding.private.type" class="flex-1">
              <USelectMenu
                v-model="state.encoding.private.type"
                option-attribute="label"
                value-attribute="value"
                :options="privateEncodingTypeOptions"
              >
                <template #label>
                  <span class="truncate">{{ privateEncodingTypeOptions.find(i => i.value === state.encoding.private.type)?.label }}</span>
                </template>
              </USelectMenu>
            </UFormGroup>
          </div>
          <div class="flex flex-row space-x-2 mt-2.5">
            <UFormGroup label="Passphrase" name="encoding.private.type" class="flex-1">
              <UInput v-model="state.encoding.private.passphrase" placeholder="Enter passphrase" type="password" />
            </UFormGroup>
            <div class="flex-1" />
          </div>
        </div>
      </div>

      <div class="flex flex-row justify-between space-x-2 pt-2">
        <div />
        <div class="flex flex-row justify-end space-x-2">
          <UButton type="submit" variant="soft" size="lg" :loading="formPending">
            Generate
          </UButton>
        </div>
      </div>
    </UForm>
  </div>
</template>
