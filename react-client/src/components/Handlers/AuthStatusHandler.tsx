import { logEvent } from "firebase/analytics";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, where } from "firebase/firestore";
import { AnimatePresence, m } from "framer-motion";
import { useContext, useState } from "react";
import { BsGoogle } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { UidContext, UserContext } from "../../context/AuthContext";
import { analytics, auth, firestore } from "../../utils/firebase";
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
    const uid = useContext(UidContext)
    const [message, setMessage] = useState<Message>({
        status: "success",
        text: ""
    })

    const handleSignUp = async () => {
        const provider = new GoogleAuthProvider()
        const user = (await signInWithPopup(auth, provider)).user
        const userExists = (await getDoc(doc(firestore, "users", user.uid))).exists()
        if (userExists) { navigate("/"); return }
        else navigate("/signup")
    }

    async function usernameCheck(username: string) {
        if (username.length < 3) {
            setMessage({
                status: "error",
                text: "Username must be at least 3 characters"
            })
            return;
        }
        const resIsProfane = await fetch(`https://www.purgomalum.com/service/containsprofanity?text=${username}`).then((res) => res.json())
        setIsProfane(resIsProfane)
        if (resIsProfane) {
            setMessage({
                status: "error",
                text: "Username must be clean"
            })
            logEvent(analytics, "profane_words", {
                word: username,
                uid,
                date: new Date().getTime()
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
    }




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


    if (auth.currentUser === null && user !== undefined) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <m.div
                    className="max-w-sm sm:w-full sm:max-w-md main-container px-5 py-5"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                    }}
                >


                    <h1 className=" text-4xl text-center font-logo">Create Account</h1>
                    <div className="flex justify-center mt-7">
                        <button onClick={handleSignUp} className="flex gap-3 items-center btn btn-primary  text-white text-xl">
                            <span>Sign Up</span>
                            <BsGoogle />
                        </button>
                    </div>
                </m.div>
            </div>
        )
    }

    if (user?.username && user !== undefined) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <m.div
                    className="max-w-sm sm:w-full sm:max-w-md main-container px-5 py-10"
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
                            onChange={(e) => { setUsername(e.target.value.replace(" ", "_").replace(/[^a-zA-Z0-9/_/]/g, "").slice(0, 15)); usernameCheck(e.target.value) }}
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