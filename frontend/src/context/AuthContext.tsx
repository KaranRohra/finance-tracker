import LoginPage from '@/components/auth/login/LoginPage';
import { createContext,  ReactNode, useState } from 'react';

type AuthContextType = {
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);



  return (
    <AuthContext.Provider value={{ isAuthenticated,setIsAuthenticated }}>
      {isAuthenticated ? children : <LoginPage />}
    </AuthContext.Provider>
  );
};
