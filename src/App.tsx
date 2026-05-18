import AppRoutes from './routes/AppRoutes';
import { UserProvider } from './context/UserContext';
import type { User } from './context/UserContext';

const currentUser: User = {
  name: 'Abinesh Subramani',
  email: 'abineshsiva191@gmail.com',
  team: 'team-alpha',
};

export default function App() {
  return (
    <UserProvider user={currentUser}>
      <AppRoutes />
    </UserProvider>
  );
}
