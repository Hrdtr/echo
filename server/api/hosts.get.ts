export default defineEventHandler(async () => {
  const hosts = await db.query.host.findMany({
    with: {
      group: true,
      hostTags: { with: { tag: true } },
    },
  })
  return hosts
})
