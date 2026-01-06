import { User } from '@/types';
import { getItem, setItem, generateId } from '@/lib/storage';

const USERS_KEY = 'users';
const CURRENT_USER_KEY = 'current_user';

export function getAllUsers(): User[] {
  return getItem<User[]>(USERS_KEY) || [];
}

export function findUserByEmail(email: string): User | undefined {
  const users = getAllUsers();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase());
}

export function createUser(name: string, email: string): User {
  const users = getAllUsers();
  const newUser: User = {
    id: generateId(),
    name,
    email: email.toLowerCase(),
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  setItem(USERS_KEY, users);
  return newUser;
}

export function getCurrentUser(): User | null {
  return getItem<User>(CURRENT_USER_KEY);
}

export function setCurrentUser(user: User | null): void {
  if (user) {
    setItem(CURRENT_USER_KEY, user);
  } else {
    localStorage.removeItem('revisaquest_' + CURRENT_USER_KEY);
  }
}

export function loginOrCreateUser(name: string, email: string): User {
  let user = findUserByEmail(email);
  if (!user) {
    user = createUser(name, email);
  } else {
    // Update name if different
    if (user.name !== name) {
      const users = getAllUsers();
      const idx = users.findIndex(u => u.id === user!.id);
      if (idx !== -1) {
        users[idx].name = name;
        setItem(USERS_KEY, users);
        user = users[idx];
      }
    }
  }
  setCurrentUser(user);
  return user;
}

export function logout(): void {
  setCurrentUser(null);
}
