import { collection, getDocs, limit, query, where } from "firebase/firestore/lite"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import Loader from "../components/Loader"
import { useAuth } from "../context/AuthContext"
import { loadFirestore } from "../utils/firebase"


export default function SettingsPage() {
    const [requestedUser, setRequestedUser] = useState(undefined as unknown as UserProfile)
    const [isAuthorized, setIsAuthorized] = useState(undefined as unknown as boolean)
    const { username } = useParams()
    const auth = useAuth()

    useEffect(() => {
        console.log(username)
        const main = async () => {
            const firestore = await loadFirestore()
            const requestedUsers = (await getDocs(query(collection(firestore, "users"), where("username", "==", username), limit(1))))
            if (requestedUsers.docs.length === 0) { setIsAuthorized(false); setRequestedUser({} as UserProfile); return }
            setRequestedUser(requestedUsers.docs[0].data() as UserProfile)
            if (!auth) return
            setIsAuthorized(requestedUsers.docs[0].data().uid === auth.uid)
        }
        main()
    }, [auth])

    useEffect(() => {
        console.log(requestedUser?.uid, isAuthorized)
    })

    if (auth && requestedUser?.uid && isAuthorized) {
        return (
            <div className="flex  justify-center items-center w-screen min-h-screen">
                Autorized
            </div>
        )
    }
    if (auth !== undefined && requestedUser?.uid && isAuthorized === false) {
        return (
            <div className="flex w-screen min-h-screen justify-center items-center">
                Not Authorized

            </div>
        )
    }

    if (auth !== undefined && !requestedUser?.uid && isAuthorized !== undefined) {
        return (
            <div className="flex justify-center items-center w-screen min-h-screen">
                User not found
            </div>
        )
    }
    return <Loader />
}

