export default defineEventHandler(async () => {
  const groups = await db.query.tag.findMany()
  return groups
})
