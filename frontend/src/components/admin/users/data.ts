export type UserStatus = 'active' | 'suspended' | 'banned';
export type UserRole = 'regular' | 'admin' | 'superadmin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  filesCount: number;
  storageUsed: number; // in bytes
  createdAt: string;
  lastLogin: string;
}

export const mockUsers: User[] = [
  {
    id: 'usr_1a2b3c4d',
    email: 'elara.vance@example.com',
    role: 'superadmin',
    status: 'active',
    filesCount: 1250,
    storageUsed: 15 * 1024 * 1024 * 1024, // 15 GB
    createdAt: '2023-01-15T10:30:00Z',
    lastLogin: '2024-07-20T14:00:00Z',
  },
  {
    id: 'usr_5e6f7g8h',
    email: 'liam.brookes@example.com',
    role: 'admin',
    status: 'active',
    filesCount: 780,
    storageUsed: 8.2 * 1024 * 1024 * 1024, // 8.2 GB
    createdAt: '2023-03-22T09:00:00Z',
    lastLogin: '2024-07-19T11:20:00Z',
  },
  {
    id: 'usr_9i0j1k2l',
    email: 'chloe.deckard@example.com',
    role: 'regular',
    status: 'suspended',
    filesCount: 50,
    storageUsed: 500 * 1024 * 1024, // 500 MB
    createdAt: '2023-05-10T18:45:00Z',
    lastLogin: '2024-06-30T22:10:00Z',
  },
  {
    id: 'usr_3m4n5o6p',
    email: 'dax.sullivan@example.com',
    role: 'regular',
    status: 'banned',
    filesCount: 2,
    storageUsed: 10 * 1024 * 1024, // 10 MB
    createdAt: '2023-07-01T12:00:00Z',
    lastLogin: '2024-07-02T08:00:00Z',
  },
  {
    id: 'usr_7q8r9s0t',
    email: 'ava.chen@example.com',
    role: 'regular',
    status: 'active',
    filesCount: 320,
    storageUsed: 2.1 * 1024 * 1024 * 1024, // 2.1 GB
    createdAt: '2023-09-05T14:20:00Z',
    lastLogin: '2024-07-20T09:05:00Z',
  },
];