const bodySchema = createInsertSchema(schema.group).omit({ id: true })

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readValidatedBody(event, body => bodySchema.parse(body))
  const [result] = await db.update(schema.group).set(body).where(eq(schema.group.id, Number(id))).returning()
  return result
})
