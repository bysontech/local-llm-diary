import Dexie, { type EntityTable } from 'dexie'

interface Item {
  id: number
  name: string
  createdAt: Date
}

const db = new Dexie('TemplateBDatabase') as Dexie & {
  items: EntityTable<Item, 'id'>
}

db.version(1).stores({
  items: '++id, name, createdAt'
})

export { db }
export type { Item }
