import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useContext, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
//import io
import { firestore } from '../utils/firebase';;
import { AuthContext } from '../context/AuthContext';
import Loader from '../components/Loader';
import { AnimatePresence, AnimateSharedLayout, LayoutGroup, m } from 'framer-motion';
import BottomNavbar from '../components/BottomNavbar';

export default function CreateRoom() {
    const [loading, setLoading] = useState(false)
    const [customMaxPlayers, setCustomMaxPlayers] = useState<number | string>(20)
    const [maxPlayers, setMaxPlayers] = useState("party");
    const [roomType, setRoomType] = useState("private");
    const [wordCount, setWordCount] = useState<number | string>(10);
    const navigate = useNavigate()
    const uid = useContext(AuthContext);

    async function generateCleanId() {
        const id = Math.floor(Math.random() * 100000).toString().padStart(5, "0");
        if ((await getDoc(doc(firestore, "rooms", `${id}`))).exists()) {
            generateCleanId()
        } else {
            return id
        }

    }

    function roomSelectToNumber(select: string) {
        switch (select) {
            case "versus":
                return 2
            case "party":
                return 5
            case "mega-party":
                return 10
            default:
                return 1
        }
    }


    async function createroom() {
        setLoading(true)
        const res = await fetch(
            process.env.NODE_ENV === "development"
                ? `http://localhost:4000/api/words?count=${wordCount || 10}`
                : `https://neo-letter-fastify.vercel.app/api/words?count=${wordCount || 10}`
        ).then((res) => res.json())
        const wordlist = res.words
        const id = await generateCleanId()
        const playerdata: Player = {
            name: "",
            uid,
            points: 0,
            ready: false,
            socketId: "",
            prevSocketId: "",
            role: "creator",
            guesses: [],
            guessed: false,
        }
        await Promise.all([
            setDoc(doc(firestore, "rooms", `${id}`), {
                id,
                maxPlayers: customMaxPlayers || roomSelectToNumber(maxPlayers),
                started: false,
                roomType,
                answers: wordlist,
                players: [],
                round: 0
            }),
            setDoc(doc(firestore, "rooms", `${id}`, "players", `${uid}`), playerdata),
        ])
        setLoading(false)
        navigate(`/join?id=${id}`)
    }
    return !loading ? (
        <>
            <Helmet>
                <title>Neo Letter | Create Room</title>
                <meta name="description" content="Home page" />
            </Helmet>
            <LayoutGroup>
                <div className="flex justify-center items-center min-h-page">
                    <m.div
                        className="sm:w-full px-20 sm:max-w-lg bg-primary-dark/30 backdrop-blur-3xl  rounded-3xl p-5 shadow-2xl"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                        }}
                        layout
                    >
                        <div className="flex justify-center mb-7 font-logo">
                            <h1 className="text-4xl">Create Room</h1>
                        </div>
                        <div className="flex flex-col gap-3 items-center">
                            <select className=" bg-transparent focus:outline-none rounded-xl text-xl  shadow-input p-3 w-52" value={maxPlayers} onChange={(e) => { setMaxPlayers(e.target.value) }}>
                                <option className='bg-primary-dark text-sm text-bold' value="versus">Versus (Max 2)</option>
                                <option className='bg-primary-dark text-sm text-bold' value="party">Party (Max 5)</option>
                                <option className='bg-primary-dark text-sm text-bold' value="mega-party">Mega Party (Max 10)</option>
                                <option className='bg-primary-dark text-sm text-bold' value="custom">Custom</option>
                            </select>
                            <AnimatePresence>
                                {maxPlayers === "custom" && (
                                    <m.div
                                        className='flex gap-3 justify-start items-center p-3 shadow-input rounded-xl w-52'
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <div className='flex justify-start w-full'>
                                            <label className='text-xl' >Players</label>
                                        </div>
                                        <div className='flex justify-end'>
                                            <input name='num' type="number" className="text-center text-xl bg-transparent focus:outline-none p-1 shadow-input-inner rounded-xl w-12  " placeholder='20' value={customMaxPlayers} onChange={(e) => setCustomMaxPlayers(parseInt(e.target.value) <= 100 && parseInt(e.target.value) > 0 ? parseInt(e.target.value) : "")} />
                                        </div>
                                    </m.div>
                                )}
                            </AnimatePresence>


                            <div className='flex items-center p-3 shadow-input rounded-xl w-52'>
                                <div className='flex justify-start w-full'>
                                    <label className='text-center text-xl'>
                                        Rounds
                                    </label>
                                </div>
                                <div className='flex justify-end'>
                                    <input type="number"
                                        placeholder='10'
                                        className="text-center text-xl bg-transparent focus:outline-none p-1 shadow-input-inner rounded-xl w-12  "
                                        value={wordCount}
                                        onChange={(e) => {
                                            setWordCount(parseInt(e.target.value) > 0 ? parseInt(e.target.value) : "")
                                        }}
                                    />
                                </div>
                            </div>
                            {/* <div className='flex justify-start items-center gap-3 p-3'>
                                <p className='text-xl'>Private</p>
                                <input className='checkbox checkbox-primary' type="checkbox" checked={roomType === "private"} onChange={(e) => setRoomType(e.target.checked ? "private" : "public")} />
                            </div> */}

                            <div className='flex flex-col items-center mt-7'>


                                <button
                                    onClick={createroom}
                                    className="transition-all flex items-center py-3 px-5 text-xl font-logo bg-primary hover:bg-red-400 active:bg-red-600 rounded-xl active:scale-95">
                                    <p className="text-white">
                                        Create Party
                                    </p>
                                </button>
                               <div className='text-lg my-0.5'>
                                   or
                               </div>
                                <Link to="/join">
                                    <p className='link link-secondary text-xl'>
                                        Join Room
                                    </p>
                                </Link>
                            </div>

                        </div>
                    </m.div>
                </div>
            </LayoutGroup>
        </>
    ) : (
        <Loader />
    )
}