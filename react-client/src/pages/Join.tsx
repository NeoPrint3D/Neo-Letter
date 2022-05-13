import { arrayUnion, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { AnimatePresence, AnimateSharedLayout, m } from "framer-motion";
import { useContext, useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useLocation } from "react-use";
import { Loading } from "../components/Loader/Loading";
import { AuthContext } from "../context/AuthContext";
import { firestore } from "../utils/firebase";



export default function JoinRoom() {
    const [loading, setLoading] = useState(false);
    const [username, setUserame] = useState("");
    const [roomId, setRoomId] = useState("");
    const [id, setId] = useState("");
    const [roomValid, setValidRoom] = useState(false);
    const navigate = useNavigate()
    const uid = useContext(AuthContext);
    const query = useLocation()


    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const valid = await checkValidRoom(roomId)
        setValidRoom(valid)

    }

    async function checkValidRoom(roomId: string) {
        const room = await getRoom(roomId)
        const maxPlayersExceeded = room?.players.length + 1 > room?.maxPlayers
        if (!room) {
            toast.error("Room does not exist", { theme: "dark" })
            return false
        }
        if (maxPlayersExceeded) {
            toast.error("Room is full", { theme: "dark" })
            return false
        }
        return true
    }




    async function getRoom(id: string) {
        const room = await getDoc(doc(firestore, "rooms", id));
        return room.data()
    }


    async function joinRoom(e: React.FormEvent<HTMLFormElement>) {
        console.log(id)
        e.preventDefault();
        if (!(username.length >= 3)) {
            toast.error("Username is too short. Must be three or more charchtr", { theme: "dark" })
            return
        }
        const docRef = doc(firestore, "rooms", id || roomId, "players", uid)
        const player = await getDoc(docRef)
        setLoading(true)
        if (player.exists()) {
            await updateDoc(docRef, {
                name: username.charAt(0).toUpperCase() + username.slice(1),
            })
            setLoading(false)
            navigate(`/room/${roomId}`);
            return
        }
        await setDoc(docRef, {
            name: username.charAt(0).toUpperCase() + username.slice(1),
            uid,
            points: 0,
            ready: false,
            socketId: "",
            prevSocketId: "",
            guesses: [],
            role: "user",
            status: ""
        })
        setLoading(false)
        navigate(`/room/${roomId}`);
    }


    useEffect(() => {
        const idRef = new URLSearchParams(query.search).get("id")
        if (idRef) {
            setId(idRef)
            setRoomId(idRef)
            checkValidRoom(idRef).then(valid => {
                setValidRoom(valid)
            })
        }
    }, [])




    return !loading ? (
        <>
            <Helmet>
                <title>Neo Letter | Join</title>
                <meta property="og:url" content="https://neo-letter.web.app/join" />
                <meta property="og:type" content="website" />
                <meta property="og:title" content="Join Room" />
                <meta
                    property="og:description"
                    content="Your friend has invited you to join a room. Join now!"
                />
                <meta property="og:image" content="/images/preview/Join.png" />

            </Helmet>
            <div className="flex justify-center items-center min-h-page">
                {!roomValid && (
                    <m.div className="bg-primary-dark/30 backdrop-blur-3xl rounded-3xl p-5 shadow-2xl px-20"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{
                            duration: 1
                        }}
                    >
                        <div className="flex justify-center mb-7 font-logo">
                            <h1 className="text-4xl sm:text-4xl">Join room</h1>
                        </div>
                        <form className="flex flex-col items-center gap-5" onSubmit={handleSubmit}>
                            <input className="p-2 shadow-input text-center rounded-xl font-semibold  bg-transparent placeholder:font-semibold focus:outline-none" type="text" placeholder="Room ID"
                                value={roomId}
                                onChange={(e) => setRoomId(e.target.value.replace(/[^0-9]/g, '').slice(0, 5))}
                            />
                            <button
                                type="submit"
                                disabled={!roomId}
                                className="transition-all flex items-center py-3 px-5 text-xl font-logo bg-primary disabled:bg-primary/10 hover:bg-red-400 active:bg-red-600 rounded-xl active:scale-95">
                                <p className="text-white">
                                    Continue
                                </p>
                            </button>
                        </form>
                    </m.div>
                )}
                {roomValid && (
                    <m.div className="px-20 bg-primary-dark/30 backdrop-blur-3xl rounded-3xl p-5 shadow-2xl"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{
                            duration: 1
                        }}
                    >
                        <div className="flex justify-center mb-7 font-logo">
                            <h1 className="text-4xl">Enter</h1>
                        </div>
                        <form className="flex flex-col items-center gap-5" onSubmit={(e) => joinRoom(e)}>
                            <input className="p-3 shadow-input rounded-xl text-center font-semibold  bg-transparent placeholder:font-semibold focus:outline-none" type="text" placeholder="Username"
                                value={username}
                                onChange={(e) => setUserame(e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 20))}
                            />
                            <button
                                disabled={!username || username.length < 3}
                                className="transition-all flex items-center py-3 px-5 text-xl font-logo bg-primary disabled:bg-primary/10 hover:bg-red-400 active:bg-red-600 rounded-xl active:scale-95">
                                <p className="text-white">
                                    Join Room
                                </p>
                            </button>
                        </form>
                    </m.div>
                )}
            </div>
        </>
    ) : (
        <Loading />
    )
}