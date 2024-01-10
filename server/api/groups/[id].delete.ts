export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  await db.delete(schema.group).where(eq(schema.group.id, Number(id)))
  setResponseStatus(event, 204)
  return null
})
