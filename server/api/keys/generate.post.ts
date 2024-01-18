import { generateKeyPairSync } from 'node:crypto'

const bodySchema = z.object({
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
      cipher: z.enum(['aes-128-cbc', 'aes-256-cbc']).optional().default('aes-128-cbc'),
      passphrase: z.string().optional(),
    }),
  }),
})

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, body => bodySchema.parse(body))
  const privateKeyCipher = body.encoding.private.passphrase ? body.encoding.private.cipher : null

  if (body.type === 'rsa') {
    if (!body.rsaModulusLength) {
      throw createError({
        message: '"rsaModulusLength" is required for RSA keys',
        status: 400,
      })
    }
    return {
      ...generateKeyPairSync(body.type, {
        modulusLength: body.rsaModulusLength,
        publicKeyEncoding: {
          type: body.encoding.public.type,
          format: body.encoding.public.format,
        },
        privateKeyEncoding: {
          type: body.encoding.private.type,
          format: body.encoding.private.format,
          cipher: privateKeyCipher ?? undefined,
          passphrase: body.encoding.private.passphrase,
        },
      }),
      privateKeyCipher,
    }
  }
  else {
    if (body.encoding.public.type === 'pkcs1' || body.encoding.private.type === 'pkcs1') {
      throw createError({
        message: 'ED25519 keys cannot be encoded as PKCS#1',
        status: 400,
      })
    }
    return {
      ...generateKeyPairSync(body.type, {
        publicKeyEncoding: {
          type: body.encoding.public.type,
          format: body.encoding.public.format,
        },
        privateKeyEncoding: {
          type: body.encoding.private.type,
          format: body.encoding.private.format,
          cipher: privateKeyCipher ?? undefined,
          passphrase: body.encoding.private.passphrase,
        },
      }),
      privateKeyCipher,
    }
  }
})
