import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useContext, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
//import io
import { firestore } from '../utils/firebase';;
import { AuthContext } from '../context/AuthContext';
import { Loading } from '../components/Loader/Loading';

export default function CreateRoom() {
    const [loading, setLoading] = useState(false)
    const [maxPlayers, setMaxPlayers] = useState("party");
    const [roomType, setRoomType] = useState("private");
    const [wordCount, setWordCount] = useState("20");
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
                ? `http://localhost:4000/api/words?count=${wordCount}`
                : `https://neo-letter-fastify.vercel.app/api/words?count${parseInt(wordCount)}`
        ).then((res) => res.json())
        const wordlist = res.words
        console.log(wordlist)

        const id = await generateCleanId()

        await Promise.all([
            setDoc(doc(firestore, "rooms", `${id}`), {
                id,
                maxPlayers: roomSelectToNumber(maxPlayers),
                started: false,
                roomType,
                answers: wordlist,
                players: [],
                round: 0
            }),
            setDoc(doc(firestore, "rooms", `${id}`, "players", `${uid}`), {
                name: "",
                uid,
                points: 0,
                ready: false,
                socketId: "",
                prevSocketId: "",
                role: "creator",
                guesses: [],
                status: ""
            }),
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
            <div className="flex justify-center items-center min-h-page">

                <div className="w-full max-w-sm sm:max-w-md">
                    <div className="bg-primary-dark/30 backdrop-blur-3xl  rounded-3xl px-8 pt-6 pb-8 mb-4 shadow-2xl">
                        <div className="flex justify-center mb-5 font-logo">
                            <h1 className="text-4xl sm:text-4xl">Create Room</h1>
                        </div>
                        <div className="flex flex-col gap-5 items-center">
                            <select className=" bg-primary-dark/90 focus:outline-none rounded  shadow-2xl p-3 w-42" value={maxPlayers} onChange={(e) => { setMaxPlayers(e.target.value) }}>
                                <option value="versus">Versus (Max 2)</option>
                                <option value="party">Party (Max 5)</option>
                                <option value="mega-party">Mega Party (Max 10)</option>
                                <option value="custom">Custom (Max ?) Coming soon</option>
                            </select>

                            <div className='grid grid-cols-2 items-center gap-3'>
                                <div className='flex items-center gap-3'>
                                    <p className='text-xl'>Private</p>
                                    <input className='checkbox checkbox-primary' type="checkbox" checked={roomType === "private"} onChange={(e) => setRoomType(e.target.checked ? "private" : "public")} />
                                </div>
                                <div className='flex flex-col justify-center items-center'>
                                    <label className='text-center'>
                                        Rounds
                                    </label>
                                    <input type="text"
                                        placeholder='20'
                                        className="bg-primary-dark/90 focus:outline-none rounded  text-center shadow-2xl w-20 sm:w-18"
                                        value={wordCount}
                                        onChange={(e) => {
                                            setWordCount((parseInt(e.target.value) > 0 && parseInt(e.target.value) <= 500) ? e.target.value : "")
                                        }}
                                    />
                                </div>
                            </div>
                            <button
                                onClick={createroom}
                                className="transition-all flex items-center py-3 px-5 text-xl font-logo bg-primary hover:bg-red-400 active:bg-red-600 rounded-xl active:scale-95">
                                <p className="text-white">
                                    Create Party
                                </p>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    ) : (
        <Loading />
    )
}