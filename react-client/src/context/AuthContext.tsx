import { onAuthStateChanged, User } from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";
import { v4 } from "uuid";
import { app, auth } from "../utils/firebase";






const UserContext = createContext(undefined as unknown as UserProfile);
const UidContext = createContext(undefined as unknown as string);
const AuthContext = createContext(undefined as unknown as User);




export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState(undefined as unknown as UserProfile);
    const [uid, setUid] = useState("")
    const [authRef, setAuthRef] = useState(undefined as unknown as User);


    useEffect(() => {

        const unsbscribe = onAuthStateChanged(auth, async (auth) => {
            setAuthRef(auth as User);
            if (!auth) { setUser({} as UserProfile); return }
            const { doc, getDoc, getFirestore, serverTimestamp, updateDoc } = await import("firebase/firestore/lite")
            const firestore = getFirestore(app)
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
        <AuthContext.Provider value={authRef}>
            <UserContext.Provider value={user}>
                <UidContext.Provider value={uid}>
                    {children}
                </UidContext.Provider>
            </UserContext.Provider>
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
export const useUid = () => useContext(UidContext)
export const useUser = () => useContext(UserContext)


