import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Logo from "/images/assets/logo.webp";
import { firestore } from "../utils/firebase";
import { Helmet } from "react-helmet";
import { RWebShare } from "react-web-share";
import { FiShare } from 'react-icons/fi'
import Grid from "../components/Grid/Grid";
import KeyBoard from "../components/Keyboard";
import { collection, doc, getDoc, onSnapshot, query, updateDoc } from "firebase/firestore";
import { AuthContext } from "../context/AuthContext";
import CheckRoomExist from "../components/Checkers/CheckRoomExist";
import { GuessesContext, GuessesDispatchContext, KeyboardContext, KeyBoardDispatchContext } from "../context/GameContext";
import { AiFillCheckCircle, AiOutlineLoading3Quarters } from "react-icons/ai";
import { useWindowSize } from "react-use";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import { RiArrowDropLeftLine, RiArrowDropRightLine } from "react-icons/ri";
import { AnimatePresence, m } from "framer-motion";
import { getGuessStatuses } from "../components/Grid/utils/getStatuses";

type Room = {
    id: string;
    answers: string[];
    maxPlayers: number;
    players: string[];
    started: boolean;
    round: number;
}




export default function GameRoom() {
    const [roomStatus, setRoomStatus] = useState(undefined as "exists" | "room_not_found" | "user_not_found" | "room_full" | undefined);
    const [room, setRoom] = useState({} as Room);
    const [socket, setSocket] = useState({})
    const [fireOffPoints, setFireOffPoints] = useState(false)
    const [currentPlayer, setCurrentPlayer] = useState({} as any)
    const [players, setPlayers] = useState([] as any[])
    const [answers, setAnswers] = useState([])
    const [round, setRound] = useState(0)
    const { id } = useParams()
    const { width } = useWindowSize()
    const uid = useContext(AuthContext)
    const key = useContext(KeyboardContext)
    const setKey = useContext(KeyBoardDispatchContext)
    const guesses = useContext(GuessesContext)
    const setGuesses = useContext(GuessesDispatchContext)
    const roomRef = useMemo(() => doc(firestore, "rooms", `${id}`), [id])
    const playerRef = useMemo(() => doc(firestore, "rooms", `${id}`, "players", uid), [id, uid])

    useEffect(() => {
        handleRoom()
    }, [])


    async function handleRoom() {
        const q = query(collection(firestore, "rooms", `${id}`, "players"))
        const unsub1 = onSnapshot(q, (playersRes) => {
            if (!room) {
                setRoomStatus("room_not_found")
                return
            }
            setPlayers(playersRes.docs.map(p => p.data()))
            setCurrentPlayer(playersRes.docs.find(p => p.data().uid === uid)?.data())
            if (playersRes.docs.length === room.maxPlayers) {
                setRoomStatus("room_full")
                return
            }
            if (!playersRes.docs.map(p => p.data().uid).includes(uid)) {
                setRoomStatus("user_not_found")
                return
            }
            setRoomStatus("exists")
        })
        const unsub2 = onSnapshot(roomRef, (roomRes) => {
            if (roomRes.exists()) {
                setRoom(roomRes.data() as Room)
                setAnswers(roomRes.data().answers)
                setRound(roomRes.data().round)

            }
        })

        return () => {
            unsub1()
            unsub2()
        }
    }


    useEffect(() => {
        if (roomStatus !== "exists") return
        const socket = io(process.env.NODE_ENV === "development" ? "http://localhost:8080" : "https://Neo-Letter.neoprint777.repl.co", {
            auth: {
                token: `${currentPlayer.name}:${uid}:${id}`
            }
        })
        socket.emit("join")
        socket.on("notify", async(data) => {
            toast(data.message, { theme: "dark" })
            if (data.type === "correctGuess") {
                setFireOffPoints(true)
                await Promise.resolve(setTimeout(() => setFireOffPoints(false), 1000))
                return
            }
        })
        socket.on("reset", async (data) => {
            setGuesses([])
            setKey([])
        })
        setSocket(socket)
    }, [roomStatus])


    async function handleReady() {
        await updateDoc(playerRef, {
            ready: true
        })
    }
    //use a callback 
    const handleEnter = useCallback(async (socket) => {
        if (key.length !== 5) return
        const res = await fetch(process.env.NODE_ENV === "development" ? `http://localhost:8080/api/valid?word=${key}` : `https://Neo-Letter.neoprint777.repl.co/api/valid?word=${key}`).then(res => res.json())
        if (!res.isValid) toast.error("Invalid Guess")
        socket.emit("guess", {
            statuses: getGuessStatuses(`${room.answers[room.round]}`.toUpperCase() as string, key),
            guesses: guesses.length
        })
        setKey("")
        await new Promise(resolve => setTimeout(resolve, 300))
        setGuesses([...guesses, key])
    }, [key, socket, room.answers, guesses])



    return (
        <CheckRoomExist roomStatus={roomStatus}>
            <Helmet>
                <title>Neo Letter Room</title>
                <meta name="description" content={`Room ${id} is where the paty is at`} />
            </Helmet>
            <header>
                <div className="grid grid-cols-3">
                    <div className="flex justify-start items-center">
                        <Link to="/" >
                            <img src={Logo} alt="logo" className="translate-y-1 scale-90"
                                height={40}
                                width={120}
                            />
                        </Link>
                    </div>
                    <div className="flex justify-center items-center font-logo">
                        <h1 className="text-2xl font-logo text-center">Room <a className="selectable  font-sans font-semibold ">{id}</a></h1>
                    </div>
                    <div className="flex justify-end items-center mr-3 ">
                        <RWebShare
                            data={{
                                title: `Join room ${id}`,
                                text: `${currentPlayer?.name} sent you a request to join room ${id}`,
                                url: `${process.env.NODE_ENV === "development" ? `http://localhost:3000/join?id=${id}` : `https://neo-letter.web.app/join?id=${id}`}`,
                            }}>
                            <button className=" transition-all flex justify-center  items-center rounded-full p-3 bg-primary text-white focus:scale-90 focus:bg-red-600">
                                <FiShare size={25} />
                            </button>
                        </RWebShare>
                    </div>
                </div>

                <div className="flex items-center h-[4.25rem] border-y-[3px] border-white/10 rounded">
                    <div className=" carousel carousel-center ">
                        <div className="flex items-center gap-2 carousel-item mx-5 py-2 px-3 rounded bg-gray-400/20">
                            {currentPlayer?.ready ? <AiFillCheckCircle className="text-green-500" size={25} /> : <AiOutlineLoading3Quarters className="animate-spin text-white" size={25} />}
                            <div className="flex items-center gap-2.5">
                                <h1 className="text-xl text-white font-logo text-center">{currentPlayer?.name}: </h1>
                                <AnimatePresence>
                                    {fireOffPoints ?
                                        (<m.p
                                            className="text-xl font-sans font-semibold text-center"
                                            animate={{
                                                scale: [.5, 1, 1.5, 1],
                                                color: ["#fff", "#22c55e", "#fff"],
                                                y: [50, 0]
                                            }}
                                            transition={{
                                                type: "spring",
                                                stiffness: 100,
                                                damping: 10
                                            }}
                                        >
                                            {currentPlayer?.points}
                                        </m.p>) :
                                        <p className="text-xl font-sans text-white font-semibold">{currentPlayer?.points}</p>
                                    }
                                </AnimatePresence>
                            </div>
                        </div>
                        {players && players.filter(p => p.uid !== uid).map((p, i) => (
                            <div className="flex items-center gap-2 carousel-item mx-5 py-2 px-3 rounded bg-gray-400/20" key={i}>
                                {p.ready ? <AiFillCheckCircle className="text-green-500" size={25} /> : <AiOutlineLoading3Quarters className="animate-spin text-white" size={25} />}
                                <p className={"text-gray-200 font-logo text-xl font-bold"}> {p.name}
                                    : <a className="">{p.points}</a></p>
                            </div>
                        ))}
                    </div>
                </div>
            </header>



            <div className={`flex items-center sm:items-end justify-center h-[calc(100vh-8rem)] sm:h-[calc(95vh)] ${width <= 380 && "scale-[90%]"}`}>
                <div className="flex flex-col items-center  sm:grid  sm:grid-rows-6 sm:items-end">
                    <div className="flex justify-center items-center sm:items-end sm:row-span-5 mb-5">
                        <Grid answer={`${answers[round]}`.toUpperCase() || ""} />
                    </div>
                    <div className="flex justify-center items-end mb-3 sm:mb-0">
                        <KeyBoard handleEnter={() => handleEnter(socket)} answer={`${answers[round]}`.toUpperCase()} />
                    </div>
                </div>
            </div>
        </CheckRoomExist>
    );
}


