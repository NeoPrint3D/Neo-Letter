import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Logo from "/images/assets/logo.webp";
import { firestore } from "../utils/firebase";
import { Helmet } from "react-helmet";
import { RWebShare } from "react-web-share";
import { FiShare } from 'react-icons/fi'
import Grid from "../components/Grid/Grid";
import KeyBoard from "../components/Keyboard";
import { arrayUnion, collection, doc, getDoc, increment, onSnapshot, query, updateDoc } from "firebase/firestore";
import { AuthContext } from "../context/AuthContext";
import RoomStatusHandler from "../components/Handlers/RoomStatusHandler";
import { GuessesContext, GuessesDispatchContext, KeyboardContext, KeyBoardDispatchContext } from "../context/GameContext";
import { useWindowSize } from "react-use";
import { io, Socket } from "socket.io-client";
import { toast } from "react-toastify";
import { FaCrown } from 'react-icons/fa'
import { RiArrowDropLeftLine, RiArrowDropRightLine } from "react-icons/ri";
import { IoClose } from 'react-icons/io5'
import { AnimatePresence, m } from "framer-motion";
import { getGuessStatuses } from "../components/Grid/utils/getStatuses";
//@ts-expect-error
import parser from "socket.io-msgpack-parser";
import { FaSquare } from 'react-icons/fa'







export default function GameRoom() {
    const [roomStatus, setRoomStatus] = useState<RoomStatuses>();
    const [room, setRoom] = useState<Room>({} as Room);
    const [fireOff, setFireOff] = useState(false)
    const [currentPlayer, setCurrentPlayer] = useState<Player>({} as Player);
    const [players, setPlayers] = useState<Player[]>([])
    const [answers, setAnswers] = useState<string[]>([])
    const [round, setRound] = useState(0)
    const [placing, setPlacing] = useState<Player[]>([])
    const [selectedId, setSelectedId] = useState("")
    const [selectedPlayer, setSelectedPlayer] = useState<Player>({} as Player)
    const [guessFireOff, setGuessFireOff] = useState("")
    const { id } = useParams()
    const { width } = useWindowSize()
    const uid = useContext(AuthContext)
    const key = useContext(KeyboardContext)
    const setKey = useContext(KeyBoardDispatchContext)
    const guesses: string[] = useContext(GuessesContext)
    const setGuesses = useContext(GuessesDispatchContext)
    const roomRef = useMemo(() => doc(firestore, "rooms", `${id}`), [id])
    const playerRef = useMemo(() => doc(firestore, "rooms", `${id}`, "players", uid), [id, uid])
    const [socket, setSocket] = useState<Socket>()

    useEffect(() => {
        const q = query(collection(firestore, "rooms", `${id}`, "players"))
        const unsub1 = onSnapshot(q, (playersRes) => {
            const players = playersRes.docs.map((doc) => { return { ...doc.data() } })
            setPlayers(players as Player[])
            setPlacing(players.sort((a, b) => b.points - a.points) as Player[])
            setCurrentPlayer(players.find((p) => p.uid === uid) as Player)
        })

        const unsub2 = onSnapshot(roomRef, (roomRes) => {
            const room = roomRes.data()
            if (!room) {
                return
            }
            setRoom(room as Room)
            setAnswers(room.answers)
            setRound(room.round)
        })
        getDoc(playerRef).then((res) => setGuesses(res.data()?.guesses))

        return () => {
            unsub1()
            unsub2()
        }
    }, [])

    useEffect(() => {
        if (roomStatus !== "exists") return
        const socket = io(process.env.NODE_ENV === "development" ? "http://localhost:8080" : "https://Neo-Letter.neoprint777.repl.co", {
            parser,
            auth: {
                token: `${currentPlayer.name}:${uid}:${id}`
            }
        })
        console.log("connected")
        setSocket(socket)
        if (round >= answers.length) {
            socket.disconnect()
            return
        }
        socket.emit("join")
        socket.on("fireGuess", (data) => {
            console.log(data.uid)
            setGuessFireOff(data.uid)
            new Promise((resolve) => setTimeout(resolve, 600)).then(() => setGuessFireOff(""))
        })
        socket.on("notify", (data) => {
            console.log(data)
            toast(data.message, { theme: "dark" })
        })
        socket.on("reset", (data) => {
            new Promise(resolve => setTimeout(resolve, 4000)).then(async () => {
                const { uid } = data
                console.log("reset")
                if (round < answers.length && currentPlayer.uid === uid) {
                    updateDoc(roomRef, { round: increment(1) })
                }
                await updateDoc(playerRef, {
                    guesses: []
                })
                setGuesses([])
                setKey("")
                setFireOff(true)
                await new Promise(resolve => setTimeout(resolve, 500))
                setFireOff(false)
            })
        })
        return () => {
            socket.disconnect()
        }
    }, [roomStatus])
    //create and array with the current player first


    useEffect(() => {
        if (!room) {
            setRoomStatus("room_not_found")
            return
        }
        if (players.length === room.maxPlayers) {
            setRoomStatus("room_full")
            return
        }
        if (!players.map(p => p.uid).includes(uid) && room?.id) {
            setRoomStatus("user_not_found")
            return
        }
        if (round >= answers.length && answers.length > 0) {
            console.log("finished")
            setRoomStatus("room_finished")
            return
        }
        if ((!players.every(p => p.ready) && !room.started) || (players.length <= 1 && players.length > 0)) {
            setRoomStatus("players_not_ready")
            return
        }
        if (room && uid && currentPlayer && players && players.length > 1) {
            setRoomStatus("exists")
            updateDoc(roomRef, {
                started: true
            })
            return
        }


    }, [players, room, round, answers])

    const handleEnter = useCallback(async (socket) => {
        if (key.length !== 5) return
        const res = await fetch(`https://neo-letter-fastify.vercel.app/api/valid?word=${key}`).then(res => res.json())
        if (!res.isValid) {
            toast.error("Invalid Guess", {
                theme: "dark",
            })
            return
        }
        updateDoc(playerRef, {
            guesses: arrayUnion(key)
        })
        setKey("")
        await new Promise(resolve => setTimeout(resolve, 150))
        setGuesses([...guesses, key])
        socket.emit("guess", {
            statuses: getGuessStatuses(`${room.answers[room.round]}`.toUpperCase() as string, key),
            guessLength: guesses.length
        })
    }, [key, socket, answers, guesses])




    return (
        <RoomStatusHandler
            winner={{
                name: placing[0]?.name,
                points: placing[0]?.points
            }}
            players={players}
            roomStatus={roomStatus} >
            <Helmet>
                <title>Neo Letter Room</title>
                <meta name="description" content={`Room ${id} is where the paty is at`} />
            </Helmet>
            <AnimatePresence>
                {selectedId &&
                    (<div className="flex justify-center items-center fixed h-screen w-screen"
                        onBlurCapture={() => setSelectedId("")}
                    >
                        <m.div
                            className="flex flex-col bg-gray-200/10 backdrop-blur-xl p-4 rounded-3xl h-[60%] w-[75%] shadow-2xl"
                            layoutId={selectedId}
                        >
                            <div className="grid grid-cols-5">
                                <div></div>
                                <div className="flex justify-center col-span-3 text-white">
                                    <h1 className="text-center text-3xl font-bold">{selectedPlayer.name}</h1>
                                </div>
                                <div className="flex justify-end w-full ">
                                    <button className=" transition-shadow duration-700 text-white hover:shadow-xl p-2 rounded-full" onClick={() => setSelectedId("")} >
                                        <IoClose size={30} />
                                    </button>
                                </div>
                            </div>
                            <div className="flex justify-center mt-1">
                                <p className="text-2xl text-white font-logo">
                                    Points: {selectedPlayer.points}
                                </p>
                            </div>
                            <div className="flex flex-col items-center  mt-5">
                                {selectedPlayer.guesses.map((guess, i) => ((
                                    <div key={i} className="grid grid-cols-5 ">
                                        {getGuessStatuses(`${room.answers[room.round]}`.toUpperCase() as string, guess).map((status, j) => (
                                            <div key={j} className="flex justify-center ">
                                                <div className="tooltip" data-tip={status.charAt(0).toLocaleUpperCase() + status.slice(1)}>
                                                    <FaSquare size={45} className={`text-white 
                                                        ${status === "correct" && "text-success"}
                                                        ${status === "present" && "text-warning"}
                                                        ${status === "absent" && "text-gray-700"}`}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )))}
                            </div>

                        </m.div>
                    </div>)}
            </AnimatePresence>

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
                    <div className="flex flex-col justify-center items-center font-logo">
                        <div className="flex text-xl gap-2">
                            <p>Round</p>
                            <AnimatePresence>
                                {fireOff ?
                                    <m.p
                                        initial={{ scale: 0, y: 50 }}
                                        animate={{ scale: [3, 1], y: 0 }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 100,
                                            damping: 10
                                        }}
                                    >{round + 1}/{answers.length}</m.p> :
                                    <p>
                                        {round + 1}/{answers.length}
                                    </p>
                                }
                            </AnimatePresence>
                        </div>
                        <h1 className=" text-xl font-sans select-text font-semibold">{id}</h1>

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
                <div className="flex items-center h-[4.25rem] border-white/10 border-y-4 rounded ">
                    <div className="flex overflow-auto scroll-hidden w-full">
                        {players && players.filter((p) => p.uid !== uid).map((player) => (
                            <m.div
                                className={`flex items-center gap-2 carousel-item mx-5 py-2 px-3 rounded  bg-gray-400/20  ${placing[0]?.points > 100 && placing[0]?.uid === player?.uid ? "text-yellow-400" : "text-gray-200"}`}
                                layoutId={player.uid}
                                key={player.uid}
                            >
                                <AnimatePresence>
                                    {placing[0]?.points > 0 && placing[0]?.uid === player?.uid && (
                                        <m.div
                                            initial={{ y: -100 }}
                                            animate={{ y: 0 }}
                                            exit={{ y: -100 }}
                                            transition={{
                                                type: "spring",
                                                stiffness: 100,
                                                damping: 10
                                            }}
                                        >
                                            <FaCrown aria-label="Crown" size={25} />
                                        </m.div>
                                    )}
                                </AnimatePresence>
                                <button className={` 
                                transition-all duration-500 font-logo text-xl
                                 ${guessFireOff === player.uid ? "text-success scale-110" : "scale-100"} 
                                 ${placing[0]?.points > 0 && placing[0]?.uid === player?.uid ? "text-yellow-400" : "text-gray-200"}
                                  `}
                                    onClick={() => {
                                        setSelectedId(player.uid)
                                        setSelectedPlayer(player)
                                    }}
                                >
                                    {player.name}: {player.points}
                                </button>
                            </m.div>
                        ))}

                    </div>
                </div>
            </header>

            <div className={`flex-col items-center sm:items-end justify-center h-screen  ${width <= 380 && "scale-[90%]"}`}>
                <m.div
                    className={`flex  gap-3 justify-center text-xl font-logo my-2
                    ${placing[0]?.points > 100 && placing[0]?.uid === currentPlayer?.uid ? "text-yellow-400" : "text-gray-200"}
                    `}
                    layout
                >
                    <AnimatePresence>
                        {placing[0]?.points > 0 && placing[0]?.uid === currentPlayer?.uid && (
                            <m.div
                                initial={{ y: -100 }}
                                animate={{ y: 0 }}
                                exit={{ y: -25, scale: 0, opacity: 0 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 100,
                                    damping: 10
                                }}
                            >
                                <FaCrown aria-label="Crown" size={25} />
                            </m.div>
                        )}
                    </AnimatePresence>
                    <h1>
                        {currentPlayer?.name} : {currentPlayer?.points}
                    </h1>
                </m.div>
                <div className="flex flex-col items-center ">
                    <div className="flex justify-center items-center sm:items-end sm:row-span-5 mb-5">
                        <Grid answer={`${answers[round]}`.toUpperCase() || ""} />
                    </div>
                    <div className={`flex justify-center items-end mb-3 sm:mb-0 ${width < 400 && "scale-[93.5%]"}`}>
                        <KeyBoard handleEnter={() => handleEnter(socket)} answer={`${answers[round]}`.toUpperCase()} />
                    </div>
                </div>
            </div>
        </RoomStatusHandler >
    );
}


