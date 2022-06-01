import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { createContext, useEffect, useState } from "react";
import { v4 } from "uuid";
import { auth, firestore } from "../utils/firebase";


export const UserContext = createContext(undefined as UserProfile | undefined);
export const UidContext = createContext(undefined as any);


export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState(undefined as UserProfile | undefined);
    const [uid, setUid] = useState("")


    useEffect(() => {
        const unsbscribe = onAuthStateChanged(auth, async (auth) => {
            console.log(auth)
            if (!auth) { setUser({} as UserProfile); return }
            const player = await getDoc(doc(firestore, "users", auth.uid))
            if (!player.exists()) return;
            await updateDoc(doc(firestore, "users", auth.uid), {
                lastLogin: serverTimestamp(),
            })
            setUser(player.data() as UserProfile);
        })
        return () => unsbscribe()
    }, [])

    useEffect(() => {
        console.log(user)
        if (user?.uid) {
            document.cookie = `neo-letter-game-uid=${user.uid}; max-age=31536000`
            setUid(user.uid)
            return
        }
        const cookie = document.cookie.split(";").find(c => c.trim().startsWith("neo-letter-game-uid="))
        if (!cookie) {
            const newUid = v4()
            setUid(newUid)
            document.cookie = `neo-letter-game-uid=${newUid}; max-age=31536000`
            return
        }
        const [, uid] = cookie.split("=")
        setUid(uid)
    }, [user])



    return (
        <UserContext.Provider value={user}>
            <UidContext.Provider value={uid}>
                {children}
            </UidContext.Provider>
        </UserContext.Provider>
    )
}

