const bodySchema = createInsertSchema(schema.host)
  .omit({ id: true, port: true })
  .merge(z.object({
    port: z.number().positive().default(22),
    tagIds: z.number().array().optional(),
  })).partial()

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, body => bodySchema.parse(body))
  const id = getRouterParam(event, 'id')

  const { tagIds, ...payload } = body

  const [result] = await db.update(schema.host).set(payload).where(eq(schema.host.id, Number(id))).returning()
  if (tagIds && tagIds.length > 0) {
    await db.delete(schema.hostTag).where(eq(schema.hostTag.hostId, result.id))
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
