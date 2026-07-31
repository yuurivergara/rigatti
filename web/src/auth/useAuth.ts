import { useContext } from 'react';
import { AuthContext, type AuthState } from './AuthContext';

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth precisa estar dentro de <AuthProvider>');
  return context;
}
