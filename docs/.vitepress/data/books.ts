export interface BookMeta {
  id: string
  short: string
  title: string
  note: string
  pageStart: number
  pageEnd: number
}

export const books = {
  'witcher-core': {
    id: 'witcher-core',
    short: 'ОК',
    title: '«Ведьмак: Настольная ролевая игра»',
    note: 'Основная книга',
    pageStart: 1,
    pageEnd: 337
  },
  'catalog-weapons-v2': {
    id: 'catalog-weapons-v2',
    short: 'КО',
    title: '«Ведьмак. Каталог оружия, версия 2»',
    note: 'Каталог оружия',
    pageStart: 1,
    pageEnd: 24
  },
  'catalog-armor-v2': {
    id: 'catalog-armor-v2',
    short: 'КБ',
    title: '«Ведьмак. Каталог брони, версия 2»',
    note: 'Каталог брони',
    pageStart: 1,
    pageEnd: 12
  },
  'alzur-tome-of-magic': {
    id: 'alzur-tome-of-magic',
    short: 'ТМ',
    title: "«Alzur's Tome of Magic», версия 1.1",
    note: 'Том магии Альзура',
    pageStart: 1,
    pageEnd: 83
  },
  'magic-gifts-excerpt': {
    id: 'magic-gifts-excerpt',
    short: 'МД',
    title: '«Магические дары / Тактические погони»',
    note: 'Фрагмент, стр. 72–77',
    pageStart: 72,
    pageEnd: 77
  }
} as const satisfies Record<string, BookMeta>

export type BookId = keyof typeof books

export const defaultBookId: BookId = 'witcher-core'

export const bookList = Object.values(books) as BookMeta[]

export function getBook(id?: string | null): BookMeta {
  if (id && id in books) return books[id as BookId]
  return books[defaultBookId]
}

export function bookShort(id?: string | null): string {
  return getBook(id).short
}

export function bookLabel(id?: string | null): string {
  const book = getBook(id)
  return `${book.short} — ${book.title}`
}

export function sourceText(bookId?: string | null, page?: number | null): string {
  const book = getBook(bookId)
  if (!page) return book.title
  return `${book.title}, стр. ${page}`
}
