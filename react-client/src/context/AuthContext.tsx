import { onAuthStateChanged } from "firebase/auth";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { createContext, useEffect, useState } from "react";
import { v4 } from "uuid";
import { auth, firestore } from "../utils/firebase";


export const AuthContext = createContext(undefined as any);


export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState("")

    useEffect(() => {
        const unsbscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) return;

            await updateDoc(doc(firestore, "players", user.uid), {
                lastLogin: serverTimestamp(),
            })

        })
        return () => unsbscribe()
    }, [])



    return (
        <AuthContext.Provider value={user}>
            {children}
        </AuthContext.Provider>
    )
}

