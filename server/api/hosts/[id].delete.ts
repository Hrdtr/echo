export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  await db.delete(schema.host).where(eq(schema.host.id, Number(id)))
  setResponseStatus(event, 204)
  return null
})
