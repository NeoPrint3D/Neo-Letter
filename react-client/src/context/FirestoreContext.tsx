import { createContext, useContext, useRef, useState } from "react"
import { Firestore } from "firebase/firestore"



const FirestoreContext = createContext(undefined as unknown as Firestore)
const FirestoreDispatchContext = createContext(undefined as any)


export default function FirestoreProvider({ children }: { children: React.ReactNode }) {
    const firestore = useRef(undefined as any)
    const setFirestore = (value: any) => firestore.current = value
    return (
        <FirestoreContext.Provider value={firestore.current} >
            <FirestoreDispatchContext.Provider value={setFirestore}>
                {children}
            </FirestoreDispatchContext.Provider>
        </FirestoreContext.Provider>

    )
}

export const useFirestore = () => [useContext(FirestoreContext) as Firestore, useContext(FirestoreDispatchContext)]
