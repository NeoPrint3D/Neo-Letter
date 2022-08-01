import { doc, getDoc, increment, setDoc, updateDoc } from 'firebase/firestore';
import { useContext, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
//import io
import { firestore } from '../utils/firebase';;
import { UserContext, UidContext } from '../context/AuthContext';
import Loader from '../components/Loader';
import { AnimatePresence, LayoutGroup, m } from 'framer-motion';

export default function CreateRoom() {
    const [loading, setLoading] = useState(false)
    const [customMaxPlayers, setCustomMaxPlayers] = useState<number | string>(20)
    const [maxPlayers, setMaxPlayers] = useState("party");
    const [roomType, setRoomType] = useState("private");
    const [allowJoinAfterStart, setAllowJoinAfterStart] = useState(true);
    const [wordCount, setWordCount] = useState<number | string>(5);
    const navigate = useNavigate()
    const user = useContext(UserContext)
    const uid = useContext(UidContext);

    async function generateCleanId() {
        const id = Math.floor(Math.random() * 100000).toString().padStart(5, "0");
        if (!(await getDoc(doc(firestore, "rooms", `${id}`))).exists()) return id
        generateCleanId()
    }

    function roomSelectToNumber(select: string) {
        switch (select) {
            case "solo": return 1;
            case "versus": return 2
            case "party": return 5
            case "mega-party": return 10
            default: return 1
        }
    }


    async function createroom() {
        setLoading(true)
        const res = await fetch(
            import.meta.env.DEV
                ? `http://localhost:4000/api/words?count=${wordCount}`
                : `https://neo-letter-fastify.vercel.app/api/words?count=${wordCount}`
        ).then((res) => res.json())
        const wordlist = res.words
        const id = await generateCleanId()
        const gamePlayerData: GamePlayer = {
            name: "",
            uid,
            points: 0,
            ready: false,
            signedIn: user?.uid === uid,
            role: "creator",
            guesses: [],
            guessed: false,
            wins: user?.wins || 0,
            gamesPlayed: user?.gamesPlayed || 0,
            totalPoints: user?.totalPoints || 0,
        }


        await Promise.all([
            setDoc(doc(firestore, "rooms", `${id}`), {
                id,
                maxPlayers: maxPlayers === "custom" ? customMaxPlayers : roomSelectToNumber(maxPlayers),
                started: false,
                roomType,
                answers: wordlist,
                players: [uid],
                round: 0,
                allowLateJoiners: allowJoinAfterStart
            }),
            setDoc(doc(firestore, "rooms", `${id}`, "players", uid), gamePlayerData),
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
                <div className="flex justify-center items-center min-h-page text-white">
                    <m.div
                        className=" w-full max-w-[23.5rem] sm:max-w-xl  main-container px-5 py-10"
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
                            <h1 className="text-4xl ">Create Room</h1>
                        </div>
                        <div className="flex flex-col gap-3 items-center">
                            <select className=" bg-transparent focus:outline-none rounded-xl text-xl  shadow-input p-3 w-52" value={maxPlayers} onChange={(e) => { setMaxPlayers(e.target.value) }}>
                                <option className="bg-primary-dark text-sm text-bold" value="solo">Solo (Max 1)</option>
                                <option className='bg-primary-dark text-sm text-bold' value="versus">Versus (Max 2)</option>
                                <option className='bg-primary-dark text-sm text-bold' value="party">Party (Max 5)</option>
                                <option className='bg-primary-dark text-sm text-bold' value="mega-party">Mega Party (Max 10)</option>
                                <option className='bg-primary-dark text-sm text-bold' value="custom">Custom</option>
                            </select>
                            {maxPlayers === "custom" && (
                                <m.div
                                    className='flex gap-3 justify-start items-center p-3 shadow-input rounded-xl w-52'
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    <div className='flex justify-start w-full'>
                                        <label className='text-xl' >Players</label>
                                    </div>
                                    <div className='flex justify-end'>
                                        <input name='num' type="number" className="text-center text-xl bg-transparent focus:outline-none p-1 shadow-input-inner rounded-xl w-12  " placeholder='20' value={customMaxPlayers} onChange={(e) => setCustomMaxPlayers(parseInt(e.target.value) <= 100 && parseInt(e.target.value) > 0 ? parseInt(e.target.value) : "")} />
                                    </div>
                                </m.div>
                            )}


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

                            <div className='flex flex-col gap-3 mt-5' >
                                <div className='flex justify-center gap-3 items-center'>
                                    <p className='text-xl '>Allow late joiners </p>
                                    <div className='flex justify-end '>
                                        <input className='checkbox checkbox-primary' type="checkbox" checked={allowJoinAfterStart} onChange={(e) => setAllowJoinAfterStart(e.target.checked)} />
                                    </div>
                                </div>

                                <div className='flex justify-center items-center gap-3'>
                                    <p className='text-xl '>Private</p>
                                    <input className='checkbox checkbox-primary' type="checkbox" checked={roomType === "private"} onChange={(e) => setRoomType(e.target.checked ? "private" : "public")} />
                                </div>
                            </div>



                            <div className='flex flex-col items-center'>
                                <button
                                    onClick={createroom}
                                    className="transition-all flex items-center py-3 px-5 text-xl font-logo bg-primary hover:bg-red-400 active:bg-red-600 rounded-xl active:scale-95">
                                    <p className="">
                                        Create Party
                                    </p>
                                </button>
                                <div className='text-lg my-0.5'>
                                    or
                                </div>
                                <Link to="/join">
                                    <p className='link link-secondary text-xl transition-all duration-300'>
                                        Join Room
                                    </p>
                                </Link>
                            </div>

                        </div>
                    </m.div>
                </div>
            </LayoutGroup >
        </>
    ) : (
        <Loader />
    )
}