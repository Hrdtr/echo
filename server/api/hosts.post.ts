const bodySchema = createInsertSchema(schema.host)
  .omit({ id: true, port: true })
  .merge(z.object({
    port: z.number().positive().default(22),
    tagIds: z.number().array().optional(),
  }))

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, body => bodySchema.parse(body))
  const { tagIds, ...payload } = body

  const [result] = await db.insert(schema.host).values(payload).returning()
  if (tagIds && tagIds.length > 0) {
    await db.insert(schema.hostTag)
      .values(tagIds.map(id => ({ hostId: result.id, tagId: id })))
      .onConflictDoNothing()
  }
  const host = await db.query.host.findFirst({
    where: (data, { eq }) => eq(data.id, result.id),
    with: {
      group: true,
      hostTags: { with: { tag: true } },
    },
  })

  return host
})
