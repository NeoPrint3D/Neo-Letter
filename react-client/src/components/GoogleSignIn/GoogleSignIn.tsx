import { GoogleAuthProvider, signInWithPopup } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { useNavigate } from "react-router-dom"
import { auth, firestore } from "../../utils/firebase"

export default function GoogleSignIn() {
    const navigate = useNavigate()



    const handleSignIn = async () => {
        const provider = new GoogleAuthProvider()
        const user = (await signInWithPopup(auth, provider)).user
        const userExists = (await getDoc(doc(firestore, "users", user.uid))).exists()
        if (userExists) return
        navigate("/signup")
    }




    return (
        <button
            className="transition-all duration-300 ease-in-out  bg-primary/10 backdrop-blur-xl  text-white flex items-center py-2 px-3 text-xl font-logo border-[2.5px] border-white  rounded-lg active:scale-95 hover:scale-105"
            onClick={handleSignIn}
        >
            Sign In
        </button>
    )
}