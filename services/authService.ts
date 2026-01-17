
import { User, AuthSession, UserRole } from '../types';

const USERS_KEY = 'flow_users_db';
const SESSION_KEY = 'flow_auth_session';

// Mock de banco de dados inicial com os editores e os clientes solicitados
const initialUsers: User[] = [
  // Admin
  { id: '1', name: 'Caio', email: 'acriativis@gmail.com', role: 'admin', company: 'Acriativis Studio' },
  
  // Editores
  { id: 'e1', name: 'Rafaela', email: 'rafaela@acriativis.com', role: 'editor', company: 'Acriativis Studio' },
  { id: 'e2', name: 'Micael', email: 'micael@acriativis.com', role: 'editor', company: 'Acriativis Studio' },
  { id: 'e3', name: 'Vitor', email: 'vitor@acriativis.com', role: 'editor', company: 'Acriativis Studio' },
  
  // Clientes
  { id: 'c1', name: 'Dan', email: 'dan@oceanoazives.com', role: 'client', company: 'Oceano Azives' },
  { id: 'c2', name: 'Ed', email: 'ed@nova.com', role: 'client', company: 'Nova' },
  { id: 'c3', name: 'Gabriel', email: 'gabriel@imperialdrones.com', role: 'client', company: 'Imperial Drones' },

  // TV Dashboard User
  { id: 'tv1', name: 'TV Studio', email: 'TVDASHBOARD', role: 'tv', company: 'Acriativis Studio' }
];

const MASTER_PASSWORD = 'Acriativis@1245';

export const authService = {
  getUsers: (): User[] => {
    const stored = localStorage.getItem(USERS_KEY);
    if (!stored) {
      localStorage.setItem(USERS_KEY, JSON.stringify(initialUsers));
      return initialUsers;
    }
    const parsedUsers = JSON.parse(stored);
    // Garante que o usuário TV exista mesmo se o localStorage for antigo
    if (!parsedUsers.find((u: User) => u.role === 'tv')) {
        parsedUsers.push(initialUsers.find(u => u.role === 'tv'));
        localStorage.setItem(USERS_KEY, JSON.stringify(parsedUsers));
    }
    return parsedUsers;
  },

  addUser: (user: User) => {
    const users = authService.getUsers();
    if (!users.find(u => u.id === user.id || u.email === user.email)) {
      users.push(user);
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
  },

  removeUser: (userId: string) => {
    const users = authService.getUsers();
    const filteredUsers = users.filter(u => u.id !== userId);
    localStorage.setItem(USERS_KEY, JSON.stringify(filteredUsers));
  },

  login: async (email: string, password: string, targetRole: UserRole): Promise<AuthSession | null> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Check especial para TV
    if (email === 'TVDASHBOARD' && password === 'TVDASHBOARD' && targetRole === 'tv') {
        const tvUser = initialUsers.find(u => u.role === 'tv')!;
        const session = { user: tvUser, token: 'tv-token' };
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        return session;
    }

    const users = authService.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user || user.role !== targetRole) return null;

    let isValidPassword = false;

    if (user.role === 'admin') {
      isValidPassword = password === MASTER_PASSWORD;
    } else if (user.role === 'editor') {
      const expectedPassword = user.name.toLowerCase() + '@acriativis';
      isValidPassword = password === expectedPassword;
    } else if (user.role === 'client') {
      const expectedPassword = user.name + '@acriativis';
      isValidPassword = password === expectedPassword;
    } else {
      isValidPassword = password.length >= 4;
    }

    if (isValidPassword) {
      const session = { user, token: `jwt-token-${Math.random().toString(36).substr(2)}` };
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      return session;
    }
    return null;
  },

  logout: () => {
    localStorage.removeItem(SESSION_KEY);
  },

  getSession: (): AuthSession | null => {
    const stored = localStorage.getItem(SESSION_KEY);
    return stored ? JSON.parse(stored) : null;
  }
};
