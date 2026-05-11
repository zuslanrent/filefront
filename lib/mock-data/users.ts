import type { User } from '@/types/regulations'

export const users: User[] = [
  {
    id: 'user1',
    name: 'Админ Супер',
    email: 'admin@company.mn',
    department: 'it',
    role: 'admin',
    avatar: undefined,
  },
  {
    id: 'user2',
    name: 'Батболд Дорж',
    email: 'batbold@company.mn',
    department: 'hr',
    role: 'manager',
  },
  {
    id: 'user3',
    name: 'Сарантуяа Ганболд',
    email: 'sarantuya@company.mn',
    department: 'finance',
    role: 'employee',
  },
  {
    id: 'user4',
    name: 'Энхбаяр Түвшин',
    email: 'enkhbayar@company.mn',
    department: 'production',
    role: 'manager',
  },
  {
    id: 'user5',
    name: 'Оюунчимэг Баатар',
    email: 'oyunchimeg@company.mn',
    department: 'quality',
    role: 'employee',
  },
  {
    id: 'user6',
    name: 'Болормаа Цэрэн',
    email: 'bolormaa@company.mn',
    department: 'safety',
    role: 'manager',
  },
  {
    id: 'user7',
    name: 'Ганбат Эрдэнэ',
    email: 'ganbat@company.mn',
    department: 'legal',
    role: 'employee',
  },
  {
    id: 'user8',
    name: 'Нямдорж Бат',
    email: 'nyamdorj@company.mn',
    department: 'marketing',
    role: 'employee',
  },
  {
    id: 'user9',
    name: 'Алтанцэцэг Дашдорж',
    email: 'altantsetseg@company.mn',
    department: 'hr',
    role: 'employee',
  },
  {
    id: 'user10',
    name: 'Түмэнбаяр Ганзориг',
    email: 'tumenbayar@company.mn',
    department: 'it',
    role: 'employee',
  },
]

// All users for selection
export const allUsers = users

// Mock current user (IT хэлтсийн admin - файл оруулах эрхтэй)
export const currentUser: User = users[0]

export function getUserById(id: string): User | undefined {
  return users.find(u => u.id === id)
}

export function getUserName(id: string): string {
  const user = getUserById(id)
  return user?.name || id
}

export function canUserUpload(user: User): boolean {
  // IT хэлтсийн хэрэглэгч л файл оруулах эрхтэй
  return user.department === 'it'
}
