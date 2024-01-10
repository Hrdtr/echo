export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  await db.delete(schema.tag).where(eq(schema.tag.id, Number(id)))
  setResponseStatus(event, 204)
  return null
})
