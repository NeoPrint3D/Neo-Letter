import { collection, doc, getDoc, getDocs, increment, query, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";
import { AnimatePresence, m } from "framer-motion";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "react-use";
import { UserContext } from "../../context/AuthContext";
import { auth, firestore } from "../../utils/firebase";
import GoogleSignIn from "../GoogleSignIn";


import Loader from "../Loader";


interface Message {
    status: "success" | "error"
    text: string
}

export default function AuthStatusHandler() {
    const navigate = useNavigate()
    const user = useContext(UserContext)
    const [username, setUsername] = useState("");
    const [isUsernameTaken, setIsUsernameTaken] = useState(true)
    const [isProfane, setIsProfane] = useState(false)
    const [message, setMessage] = useState<Message>({
        status: "success",
        text: ""
    })
    useDebounce(
        async () => {

            if (username.length < 3) {
                setMessage({
                    status: "error",
                    text: "Username must be at least 3 characters"
                })
                return;
            }
            const res = await fetch(
                import.meta.env.DEV
                    ? `http://localhost:4000/api/profane?username=${username}`
                    : `https://neo-letter-fastify.vercel.app/api/profane?username=${username}`).then((res) => res.json())
            const isProfane = res.isProfane
            setIsProfane(res.isProfane)
            if (isProfane) {
                setMessage({
                    status: "error",
                    text: "Username must be clean"
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
            createdAt: serverTimestamp() as Timestamp,
            updatedAt: serverTimestamp() as Timestamp,
            profilePic: auth.currentUser?.photoURL || "",
            wins: 0,
            gamesPlayed: 0,
            totalPoints: 0,
            lastRoom: "",
            email: auth.currentUser?.email || "",
        }
        await Promise.all([
            setDoc(doc(firestore, "users", `${auth.currentUser?.uid}`), userProfile),
        ])



        navigate("/?action=reload")
    }


    if (auth.currentUser === null) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <m.div
                    className="sm:w-full sm:max-w-md main-container px-5 py-10"
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
                    className="sm:w-full sm:max-w-md main-container px-5 py-10"
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
                <m.div className=" sm:w-full sm:max-w-md main-container px-5 py-10 "
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
                                <m.div className={` shadow-input  rounded-3xl  p-2 bg-primary-dark/60 font-bold text-lg text-center ${message.status === "error" && "text-error shadow-error shadow-md bg-red-400"} ${message.status === "success" && "text-green-700 shadow-success shadow-md bg-green-400"}`}>
                                    {message.text}
                                </m.div>
                            }
                        </AnimatePresence>
                        <button
                            disabled={!username || username.length < 3 || isUsernameTaken || isProfane}
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