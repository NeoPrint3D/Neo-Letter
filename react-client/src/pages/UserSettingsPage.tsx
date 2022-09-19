import { collection, doc, getDoc, getDocs, limit, query, where } from "firebase/firestore/lite"
import { useContext, useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import Loader from "../components/Loader"
import { UidContext, useAuth } from "../context/AuthContext"
import { loadFirestore } from "../utils/firebase"


export default function SettingsPage() {
    const [requestedUser, setRequestedUser] = useState(undefined as unknown as UserProfile)
    const [isAuthorized, setIsAuthorized] = useState(undefined as unknown as boolean)
    const { username } = useParams()
    const user = useAuth()

    useEffect(() => {
        console.log(username)
        const main = async () => {
            const firestore = await loadFirestore()
            const requestedUsers = (await getDocs(query(collection(firestore, "users"), where("username", "==", username), limit(1))))
            if (requestedUsers.docs.length === 0) { setIsAuthorized(false); setRequestedUser({} as UserProfile); return }
            setRequestedUser(requestedUsers.docs[0].data() as UserProfile)
            if (!user) return
            setIsAuthorized(requestedUsers.docs[0].data().uid === user.uid)
        }
        main()
    }, [user])

    useEffect(() => {
        console.log(requestedUser?.uid, isAuthorized)
    })

    if (user && requestedUser?.uid && isAuthorized) {
        return (
            <div className="flex  justify-center items-center w-screen min-h-screen">
                Autorized
            </div>
        )
    }
    if (user !== undefined && requestedUser?.uid && isAuthorized === false) {
        return (
            <div className="flex w-screen min-h-screen justify-center items-center">
                Not Authorized

            </div>
        )
    }

    if (user !== undefined && !requestedUser?.uid && isAuthorized !== undefined) {
        return (
            <div className="flex justify-center items-center w-screen min-h-screen">
                User not found
            </div>
        )
    }
    return <Loader />
}

