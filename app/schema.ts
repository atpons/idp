import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
    id: text('id').primaryKey().notNull(),
    name: text('name').notNull(),
}, (users) => ({
    idIdx: uniqueIndex('idIdx').on(users.id)
}))
export const webauthn_credentials = sqliteTable('webauthn_credentials', {
    public_key: text('public_key').primaryKey().notNull(),
    user_id: text('user_id').notNull().references(() => users.id),
}, (webauthn_credentials) => ({
    userIdIdx: uniqueIndex('user_id_idx').on(webauthn_credentials.user_id)
}))

export const tests = sqliteTable('tests', {
    id: integer('id').primaryKey().notNull(),
    name: text('name').notNull(),
});