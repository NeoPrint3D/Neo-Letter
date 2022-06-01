import { collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, where } from "firebase/firestore";
import { AnimatePresence, m } from "framer-motion";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "react-use";
import GoogleSignIn from "../components/GoogleSignIn";
import Loader from "../components/Loader";
import { UserContext } from "../context/AuthContext";
import { firestore, auth } from "../utils/firebase";


interface Message {
    status: "success" | "error"
    text: string
}

export default function SignUpPage() {
    const [username, setUsername] = useState("");
    const [isUsernameTaken, setIsUsernameTaken] = useState(true)
    const [message, setMessage] = useState<Message>({
        status: "success",
        text: ""
    })
    const navigate = useNavigate()
    const user = useContext(UserContext)





    useDebounce(
        async () => {
            if (username.length < 3) {
                setMessage({
                    status: "error",
                    text: "Username must be at least 3 characters"
                })
                return;
            }

            const nameTaken = (await getDocs(query(collection(firestore, "users"), where("username", "==", username)))).docs[0]
            if (nameTaken) {
                setIsUsernameTaken(true);
                setMessage({
                    status: "error",
                    text: "Username is taken"
                })
                return;
            }
            setIsUsernameTaken(false);
            setMessage({
                status: "success",
                text: "Username is available"
            })
        },
        1000,
        [username]
    );


    async function createAccount(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        console.log(auth)
        if (isUsernameTaken || username.length < 3 || !auth.currentUser) return;
        const userRef = await getDoc(doc(firestore, "users", `${auth.currentUser?.uid}`))
        if (userRef.exists()) {
            return;
        }
        const userProfile: UserProfile = {
            username,
            uid: auth.currentUser?.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            profilePic: auth.currentUser?.photoURL || "",
            wins: 0,
            losses: 0,
            gamesPlayed: 0,
            points: 0
        }
        await setDoc(doc(firestore, "users", `${auth.currentUser?.uid}`), userProfile)
        navigate("/?action=reload")
    }


    if (!auth.currentUser && auth.currentUser !== null) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <m.div
                    className="sm:w-full sm:max-w-md main-container px-5"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                    }}
                >


                    <h1 className=" text-4xl text-center font-logo"> Please sign in to create an account</h1>
                    <div className="flex justify-center mt-10">
                        <GoogleSignIn />
                    </div>
                </m.div>
            </div>
        )
    }

    if (user?.uid) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <m.div
                    className="sm:w-full sm:max-w-md main-container px-5"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                    }}
                >

                    <h1 className=" text-4xl text-center font-logo">
                        You are already signed in
                    </h1>
                </m.div>
            </div>
        )
    }

    if (!user?.uid && auth.currentUser) {

        return (
            <div className="flex justify-center items-center min-h-screen">
                <m.div className=" sm:w-full sm:max-w-md main-container px-5"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                    }}
                >
                    <div className="flex justify-center mb-7 font-logo">
                        <h1 className="text-4xl text-center">Enter Your Username</h1>
                    </div>
                    <form className="flex flex-col items-center gap-5" onSubmit={(e) => createAccount(e)}>
                        <input className="p-3 shadow-input rounded-xl text-center font-semibold  bg-transparent placeholder:font-semibold focus:outline-none" type="text" placeholder="Username"
                            value={username}
                            //make sure that it is a number or a letter or a space
                            onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9 ]/g, "").replace(/\b\w/g, l => l.toUpperCase()))}
                        />


                        <AnimatePresence>
                            {message.text.length > 0 &&
                                <m.div className={` shadow-input  rounded-3xl  p-2 bg-primary-dark/60 font-bold text-center text-${message.status}`}>
                                    {message.text}
                                </m.div>
                            }
                        </AnimatePresence>



                        <button
                            disabled={!username || username.length < 3 || isUsernameTaken}
                            className="transition-all flex items-center py-3 px-5 text-xl font-logo bg-primary disabled:bg-primary/10 hover:bg-red-400 active:bg-red-600 rounded-xl active:scale-95">
                            <p className="text-white">
                                Create Account
                            </p>
                        </button>
                    </form>
                </m.div>
            </div>
        )
    }

    return <Loader />
}