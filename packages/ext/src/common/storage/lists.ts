import { RxDocument } from "rxdb";
import { genId } from "../util";
import { getDB } from "./db";

export interface List {
  id: string,
  title: string,
  pinned: boolean,
  color: string,
  order: number,
  createdAt: number,
  updatedAt: number,
}

export type ListDoc = RxDocument<List>

const initList = (): List => {
  return {
    id: genId(),
    title: '',
    pinned: false,
    color: '',
    order: Date.now(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
}

const getListById = async (listId: string) => {
  const db = await getDB()
  const list = await db.lists.findOne({ selector: { id: listId } }).exec()
  return list
}

const getOrCreateList = async (listId?: string) => {
  if (listId) {
    const list = await getListById(listId)
    return list
  }
  return createList()
}

const createList = async () => {
  const db = await getDB()
  const list = initList()
  return db.lists.insert(list)
}

type ListMutableFields = 'color' | 'title' | 'pinned' | 'order'

const updateList = async (id: string, opt: Partial<Pick<List, ListMutableFields>>) => {
  const db = await getDB()
  const list: ListDoc = await db.lists.findOne({ selector: { id } }).exec()

  if (!list) return

  return list.atomicUpdate(doc => {
    return { ...doc, ...opt, updatedAt: Date.now() }
  })
}

const deleteList = async (id: string) => {
  const db = await getDB()
  const list: ListDoc = await db.lists.findOne({ selector: { id } }).exec()
  await list.remove()
}

const getLatestList = async () => {
  const db = await getDB()
  const list: ListDoc = await db.lists.findOne().sort({
    order: 'desc',
  }).exec()
  return list
}

export const listStorage = {
  getListById,
  getOrCreateList,
  createList,
  updateList,
  deleteList,
  getLatestList,
}
