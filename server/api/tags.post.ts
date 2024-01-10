const bodySchema = createInsertSchema(schema.tag).omit({ id: true })

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, body => bodySchema.parse(body))
  const [result] = await db.insert(schema.tag).values(body).returning()
  return result
})
