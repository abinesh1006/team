import { createContext, useContext } from 'react';

export interface User {
  name: string;
  email: string;
  team: string;
}

interface UserContextType {
  user: User;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ user, children }: { user: User; children: React.ReactNode }) {
  return (
    <UserContext.Provider value={{ user }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): User {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used inside UserProvider');
  return ctx.user;
}
