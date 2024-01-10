const bodySchema = createInsertSchema(schema.tag).omit({ id: true })

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readValidatedBody(event, body => bodySchema.parse(body))
  const [result] = await db.update(schema.tag).set(body).where(eq(schema.tag.id, Number(id))).returning()
  return result
})
