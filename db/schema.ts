import { relations } from 'drizzle-orm'
import { index, integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const group = sqliteTable('group', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
})

export const host = sqliteTable('host', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  host: text('host').notNull(),
  port: integer('port').notNull(),
  username: text('username').notNull(),
  password: text('password'),
  privateKey: text('private_key'),
  privateKeyPassphrase: text('private_key_passphrase'),
  starred: integer('starred', { mode: 'boolean' }).notNull().default(false),
  groupId: integer('group_id').references(() => group.id, { onDelete: 'set null' }),
}, host => ({
  hostIdx: index('hostIdx').on(host.host),
}))

export const tag = sqliteTable('tag', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  color: text('color').notNull(),
})

export const groupRelations = relations(group, ({ many }) => ({
  host: many(host),
}))

export const hostTag = sqliteTable('host_tag', {
  hostId: integer('host_id').notNull().references(() => host.id, { onDelete: 'cascade' }),
  tagId: integer('tag_id').notNull().references(() => tag.id, { onDelete: 'cascade' }),
}, t => ({
  pk: primaryKey({ columns: [t.hostId, t.tagId] }),
}))

export const hostRelations = relations(host, ({ one, many }) => ({
  group: one(group, {
    fields: [host.groupId],
    references: [group.id],
  }),
  hostTags: many(hostTag),
}))

export const tagRelations = relations(tag, ({ many }) => ({
  hostTags: many(hostTag),
}))

export const hostTagRelations = relations(hostTag, ({ one }) => ({
  tag: one(tag, {
    fields: [hostTag.tagId],
    references: [tag.id],
  }),
  host: one(host, {
    fields: [hostTag.hostId],
    references: [host.id],
  }),
}))
