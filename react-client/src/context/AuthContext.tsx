import { createContext, useEffect, useState } from "react";
import { v4 } from "uuid";


export const AuthContext = createContext(undefined as any);


export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState("")

    useEffect(() => {
        const user = localStorage.getItem('neo-letter-user');
        if (!user) {
            const id = v4();
            localStorage.setItem('neo-letter-user', id);
        } else {
            setUser(user);
        }
    }, [])



    return (
        <AuthContext.Provider value={user}>
            {children}
        </AuthContext.Provider>
    )
}

