import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Logo from "/images/assets/logo.webp";
import { firestore } from "../utils/firebase";
import { Helmet } from "react-helmet";
import { RWebShare } from "react-web-share";
import { FiShare } from 'react-icons/fi'
import Grid from "../components/Grid/Grid";
import KeyBoard from "../components/Keyboard";
import { collection, doc, getDoc, increment, onSnapshot, query, updateDoc } from "firebase/firestore";
import { UidContext } from "../context/AuthContext";
import RoomStatusHandler from "../components/Handlers/RoomStatusHandler";
import { GuessesContext, GuessesDispatchContext, KeyboardContext, KeyBoardDispatchContext } from "../context/GameContext";
import { useWindowSize } from "react-use";
import { toast } from "react-toastify";
import { FaCrown } from 'react-icons/fa'
import { RiArrowDropLeftLine, RiArrowDropRightLine } from "react-icons/ri";
import { AnimatePresence, m } from "framer-motion";
import UserPreview from "../components/UserPreview";







export default function GameRoom() {
    const [roomStatus, setRoomStatus] = useState<RoomStatuses>();
    const [room, setRoom] = useState<Room>({} as Room);
    const [fireOff, setFireOff] = useState(false)
    const [currentPlayer, setCurrentPlayer] = useState<Player>({} as Player);
    const [players, setPlayers] = useState<Player[]>([])
    const [playerProfiles, setPlayerProfiles] = useState({})
    const [answers, setAnswers] = useState<string[]>([])
    const [round, setRound] = useState(0)
    const [placing, setPlacing] = useState<Player[]>([])
    const [selectedId, setSelectedId] = useState("")
    const [selectedPlayer, setSelectedPlayer] = useState<Player>({} as Player)
    const [guessFireOff, setGuessFireOff] = useState<string[]>([])
    const [hasGuessed, setHasGuessed] = useState(false)
    const [resetWinner, setResetWinner] = useState(false)
    const { id } = useParams()
    const { width } = useWindowSize()
    const uid = useContext(UidContext)
    const key = useContext(KeyboardContext)
    const setKey = useContext(KeyBoardDispatchContext)
    const guesses: string[] = useContext(GuessesContext)
    const setGuesses = useContext(GuessesDispatchContext)
    const roomRef = useMemo(() => doc(firestore, "rooms", `${id}`), [id])
    const playerRef = useMemo(() => doc(firestore, "rooms", `${id}`, "players", uid), [id, uid])


    const handlePlayersGuess = useCallback((players: Player[]) => {
        setGuessFireOff(players.filter(player => player.guessed).map(player => player.uid))
    }, [])
    const handleEveryoneGuessed = useCallback(async (players: Player[]) => {
        if (!players.every((p) => p.guesses.length === 6)) return
        toast.warning("Everyone has guessed", { theme: "dark" })
        await new Promise((resolve) => setTimeout(resolve, 1750))
        if (currentPlayer.role === "creator") {
            await Promise.all([
                players.map((p) => updateDoc(doc(firestore, "rooms", `${id}`, "players", p.uid), { guesses: [] })),
                updateDoc(roomRef, { round: round < answers.length ? increment(1) : round })
            ])
        }
        setFireOff(true)
        await new Promise(resolve => setTimeout(resolve, 300))
        setFireOff(false)
        setGuesses([])
        setKey("")
    }, [players])
    const handleEnter = useCallback(async () => {
        if (key.length !== 5) return
        setHasGuessed(true)
        const res = await fetch(`https://neo-letter-fastify.vercel.app/api/valid?word=${key}`).then(res => res.json())
        if (!res.isValid) {
            toast.error("Invalid Guess", {
                theme: "dark",
            })
            setHasGuessed(false)
            return
        }
        setKey("")
        await new Promise(resolve => setTimeout(resolve, 150))
        setGuesses([...guesses, key])
        await updateDoc(playerRef, {
            guesses: [...guesses, key],
            guessed: true,
        })
        await new Promise(resolve => setTimeout(resolve, 450))
        await updateDoc(playerRef, { guessed: false, guessedCorrectly: false })
        setHasGuessed(false)
    }, [key, guesses])
    const handleRoomWin = useCallback(async (players: Player[]) => {
        const winner = players.filter(p => p.guesses.includes(answers[round]?.toUpperCase()))[0]
        if (!winner) return
        if (resetWinner) return
        setResetWinner(true);
        const updateStack: Promise<void>[] = [];
        await new Promise(resolve => setTimeout(resolve, 4500));
        if (currentPlayer.uid === winner.uid) {
            players.map(p => updateStack.push(updateDoc(doc(firestore, "rooms", `${id}`, "players", p.uid), {
                guesses: [],
                points: winner.uid === p.uid ? increment(100 - (p.guesses.length - 1) * 10) : p.points
            })));
            await Promise.all([...updateStack, updateDoc(roomRef, {
                round: round < answers.length ? increment(1) : round
            })]);
        }
        setFireOff(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setFireOff(false);
        setGuesses([]);
        setKey("");
        setResetWinner(false);
    }, [answers, players])

    useEffect(() => {
        const q = query(collection(firestore, "rooms", `${id}`, "players"))
        const unsub1 = onSnapshot(q, async (playersRes) => {
            const players = playersRes.docs.map((doc) => { return { ...doc.data() } }) as Player[]
            handlePlayersGuess(players)
            handleEveryoneGuessed(players)
            setPlayers(players)
            setPlacing(players.filter((p) => p.points > 0).length > 0 ? players.sort((a, b) => b.points! - a.points!) : [])
            setCurrentPlayer(players.find((p) => p.uid === uid) as Player)
        })

        const unsub2 = onSnapshot(roomRef, (roomRes) => {
            const room = roomRes.data()
            if (!room) {
                setRoomStatus("room_not_found")
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
        if (players.length > room.maxPlayers) {
            setRoomStatus("room_full")
            return
        }
        if (!players.map(p => p.uid).includes(uid) && players.length > 0) {
            setRoomStatus("user_not_found")
            return
        }
        if (round >= answers.length && answers.length > 0) {
            console.log("finished")
            const lastRoom = localStorage.getItem("lastRoom")
            setRoomStatus("room_finished")
            console.log(players.filter(p => p.points > 0 && p.signedIn))
            if (lastRoom === id) return
            placing.filter(player => player.points > 0 && player.signedIn).map(player => {
                updateDoc(doc(firestore, "users", player?.uid), {
                    points: increment(player.points),
                    wins: placing[0].uid === player.uid ? increment(1) : increment(0)
                })
            })
            localStorage.setItem("lastRoom", id as string)
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
    }, [room, players, round, answers])




    useEffect(() => {
        handleRoomWin(players)
    }, [answers, players])


    return (
        <RoomStatusHandler
            winner={{
                name: placing[0]?.name || "No one won",
                points: placing[0]?.points || 0
            }}
            players={players}
            roomStatus={roomStatus} >
            <Helmet>
                <title>Neo Letter Room</title>
                <meta name="description" content={`Room ${id} is where the paty is at`} />
            </Helmet>
            <UserPreview selectedId={selectedId} selectedPlayer={selectedPlayer} room={room} setSelectedId={setSelectedId} width={width} />
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
                                        }}>{round + 1}/{answers.length}</m.p> : <p>{round + 1}/{answers.length}</p>
                                }
                            </AnimatePresence>
                        </div>
                        <h1 className=" text-xl font-sans select-text font-semibold">ID: {id}</h1>
                    </div>
                    <div className="flex items-center justify-end mr-3">
                        <div className="tooltip tooltip-left" data-tip={"Share?"}>
                            <RWebShare
                                data={{
                                    title: `Join room ${id}`,
                                    text: `${currentPlayer?.name} sent you a request to join room ${id}`,
                                    url: `${process.env.NODE_ENV === "development" ? `http://localhost:3000/join?id=${id}` : `https://neo-letter.web.app/join?id=${id}`}`,
                                }}>
                                <button className=" transition-all duration-300 flex justify-center  items-center rounded-full p-3 bg-primary text-white active:scale-90">
                                    <FiShare size={25} />
                                </button>
                            </RWebShare>
                        </div>
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
                                 ${placing[0]?.points > 0 && placing[0]?.uid === player?.uid ?
                                        `${guessFireOff.includes(player.uid) ? "text-success scale-[150%] " : "scale-100 text-yellow-400"}` :
                                        `${guessFireOff.includes(player.uid) ? "text-success scale-[150%] " : "scale-100 text-gray-200"} `}
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
                    ${placing[0]?.points > 0 && placing[0]?.uid === currentPlayer?.uid ? "text-yellow-400" : "text-gray-200"}
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
                        <KeyBoard handleEnter={() => handleEnter()} hasGuessed={hasGuessed} answer={`${answers[round]}`.toUpperCase()} />
                    </div>
                </div>
            </div>
        </RoomStatusHandler >
    );
}


