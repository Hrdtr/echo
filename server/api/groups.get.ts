export default defineEventHandler(async () => {
  const groups = await db.query.group.findMany()
  return groups
})
