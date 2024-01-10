const bodySchema = createInsertSchema(schema.group).omit({ id: true })

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, body => bodySchema.parse(body))
  const [result] = await db.insert(schema.group).values(body).returning()
  return result
})
