import { createContext,  ReactNode, useState } from 'react';
type UserContextType = {
    user: object;
    setUser: React.Dispatch<React.SetStateAction<object>>;
    };
export const UserContext = createContext<UserContextType | undefined>(undefined);
export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState({});
    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
}