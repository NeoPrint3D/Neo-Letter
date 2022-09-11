import { collection, doc, getDoc, increment, onSnapshot, query, updateDoc } from "firebase/firestore";
import { AnimatePresence, m } from "framer-motion";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { FaCrown } from 'react-icons/fa';
import { FiShare } from 'react-icons/fi';
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useWindowSize } from "react-use";
import { RWebShare } from "react-web-share";
import Grid from "../components/Grid/Grid";
import RoomStatusHandler from "../components/Handlers/RoomStatusHandler";
import KeyBoard from "../components/Keyboard";
import UserPreview from "../components/UserPreview";
import { UidContext } from "../context/AuthContext";
import { GuessesContext, GuessesDispatchContext, KeyboardContext, KeyBoardDispatchContext } from "../context/GameContext";
import { firestore } from "../utils/firebase";
import Logo from "/images/assets/logo.webp";

export default function GameRoom() {
    const [roomStatus, setRoomStatus] = useState<RoomStatuses>();
    const [room, setRoom] = useState<Room>({} as Room);
    const [fireOff, setFireOff] = useState(false)
    const [currentPlayer, setCurrentPlayer] = useState<GamePlayer>({} as GamePlayer);
    const [players, setPlayers] = useState<GamePlayer[]>([])
    const [answers, setAnswers] = useState<string[]>([])
    const [round, setRound] = useState(0)
    const [placing, setPlacing] = useState<GamePlayer[]>([])
    const [selectedId, setSelectedId] = useState("")
    const [selectedPlayer, setSelectedPlayer] = useState<GamePlayer>({} as GamePlayer)
    const [guessFireOff, setGuessFireOff] = useState<string[]>([])
    const [hasGuessed, setHasGuessed] = useState(false)
    const [resetWinner, setResetWinner] = useState(false)
    const { id } = useParams()
    const { height, width } = useWindowSize()
    const uid = useContext(UidContext)
    const key = useContext(KeyboardContext)
    const setKey = useContext(KeyBoardDispatchContext)
    const guesses: string[] = useContext(GuessesContext)
    const setGuesses = useContext(GuessesDispatchContext)
    const roomRef = useMemo(() => doc(firestore, "rooms", `${id}`), [id])
    const playerRef = useMemo(() => doc(firestore, "rooms", `${id}`, "players", uid), [id, uid])
    const winner = useMemo(() => players.filter(p => p.guesses.includes(answers[round]?.toUpperCase()))[0], [players, answers, round])



    const handlePlayersGuess = useCallback((players: GamePlayer[]) => {
        setGuessFireOff(players.filter(player => player.guessed).map(player => player.uid))
    }, [])
    const handleEveryoneGuessed = useCallback(async (players: GamePlayer[]) => {
        if (players.length === 0) return
        if (!players.every(player => player.guesses.length === 6)) return
        toast.warning("Everyone has guessed.", { theme: "dark" })
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
        const res = await fetch(import.meta.env.DEV ? `http://localhost:4000/api/valid?word=${key}` : `https://neo-letter-fastify.vercel.app/api/valid?word=${key}`)
        const data = await res.json()
        if (!data.isValid && !room.customWords) {
            toast.error("Invalid Guess.", { theme: "dark" })
            setHasGuessed(false)
            return
        }
        setKey("")
        await new Promise(resolve => setTimeout(resolve, 150))
        setGuesses([...guesses, key])
        await updateDoc(playerRef, {
            guesses: [...guesses, key], guessed: true,
        })
        await new Promise(resolve => setTimeout(resolve, 450))
        await updateDoc(playerRef, { guessed: false, guessedCorrectly: false })
        setHasGuessed(false)
    }, [key, guesses])
    const handleRoomWin = useCallback(async (players: GamePlayer[]) => {
        if (!winner || resetWinner) return
        setResetWinner(true);
        await updateDoc(roomRef, { gameStatus: "roundReset" })
        await new Promise(resolve => setTimeout(resolve, 5000));
        if (currentPlayer.uid === winner.uid) {
            const playerStack: Promise<void>[] = [];
            players.map(p => playerStack.push(updateDoc(doc(firestore, "rooms", `${id}`, "players", p.uid), {
                guesses: [],
                points: winner.uid === p.uid ? increment(100 - (p.guesses.length - 1) * 10) : increment(0),
            })));
            await Promise.all([...playerStack, updateDoc(roomRef, {
                round: round < answers.length ? increment(1) : increment(0),
            })]);
        }
        setFireOff(true);
        await new Promise(resolve => setTimeout(resolve, 300));
        setFireOff(false);
        setGuesses([]);
        setKey("");
        setResetWinner(false);
    }, [answers, players])

    // const handleIdle = useCallback(async (room: Room) => {
    //     const roomInfo = localStorage.getItem("roomInfo")
    //     if (!roomInfo) return
    //     if (roomInfo.split("|")[0] !== id && !(roomInfo.split("|")[1] === room.round)) return
    // })


    useEffect(() => {
        const q = query(collection(firestore, "rooms", `${id}`, "players"))



        const unsub1 = onSnapshot(q, async (playersRes) => {
            const players = playersRes.docs.map((doc) => { return { ...doc.data() } }) as GamePlayer[]
            handlePlayersGuess(players)
            handleEveryoneGuessed(players)
            setPlayers(players)
            setPlacing(players.filter((p) => p.points > 0).length > 0 ? players.sort((a, b) => b.points! - a.points!) : [])
            setCurrentPlayer(players.find((p) => p.uid === uid) as GamePlayer)
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
        const main = async () => {
            if (players.length > room.maxPlayers) {
                setRoomStatus("room_full")
                return
            }
            if (players.map(p => p.uid).includes(uid) === false && players.length > 0) {
                setRoomStatus("user_not_found")
                return
            }
            if (round >= answers.length && answers.length > 0) {
                setRoomStatus("room_finished")
                if (!currentPlayer.signedIn) return
                const lastRoom = (await getDoc(doc(firestore, "users", currentPlayer.uid))).data()?.lastRoom
                if (lastRoom === id) return
                await updateDoc(doc(firestore, "users", uid), {
                    lastRoom: id,
                    wins: placing[0]?.uid === currentPlayer.uid && room.maxPlayers !== 1 ? increment(1) : increment(0),
                    gamesPlayed: increment(1),
                    totalPoints: increment(currentPlayer.points)
                })
                return
            }
            if ((!players.every(p => p.ready) && !room.started && !(room.maxPlayers === 1)) || (players.length <= 1 && players.length > 0 && !(room.maxPlayers === 1))) {
                setRoomStatus("players_not_ready")
                return
            }
            if (room && uid && currentPlayer && players && (room.maxPlayers === 1 || players.length > 1)) {
                setRoomStatus("exists")
                updateDoc(roomRef, { started: true })
                return
            }
        }
        main()
    }, [room, players, round, answers, currentPlayer])




    useEffect(() => {
        handleRoomWin(players)
    }, [answers, players])


    return (
        <RoomStatusHandler
            winner={{
                name: placing[0]?.name || "No one won",
                points: placing[0]?.points || 0,
                uid: placing[0]?.uid
            }}
            players={players}
            roomStatus={roomStatus} >
            <Helmet>
                <title>Neo Letter</title>
                <meta name="description" content={`Room ${id} is where the paty is at`} />
            </Helmet>
            <UserPreview selectedId={selectedId} height={height} selectedPlayer={selectedPlayer} room={room} setSelectedId={setSelectedId} width={width} />

            <div className="min-h-screen">
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
                                        url: `${import.meta.env.DEV ? `http://localhost:3005/join?id=${id}` : `https://neo-letter.web.app/join?id=${id}`}`,
                                    }}>
                                    <button className=" transition-all duration-300 flex justify-center  items-center rounded-full p-3 bg-primary text-white active:scale-90">
                                        <FiShare size={25} />
                                    </button>
                                </RWebShare>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center h-[4.25rem] border-slate-500/40 border-y-4  ">
                        <div className="flex items-center overflow-auto scroll-hidden h-full w-full ">
                            {players && players.filter((p) => p.uid !== uid).map((player) => (
                                <m.button
                                    key={player.uid}
                                    transition={{
                                        layout: {
                                            type: "easeInOut",
                                            duration: 0.5
                                        }
                                    }}
                                    layout
                                    onClick={() => {
                                        setSelectedId(player.uid)
                                        setSelectedPlayer(player)
                                    }}
                                >
                                    <div>
                                        {selectedId !== player.uid &&
                                            <m.div
                                                className={`flex  items-center gap-2 carousel-item mx-5 py-2 px-3 rounded transition-all duration-500  bg-gray-400/10  backdrop-blur-md border-b-4  ${placing[0]?.uid === player.uid ? "text-yellow-400 shadow-lg shadow-yellow-200" : "border-primary"}   ${placing[0]?.uid === player?.uid ? "border-yellow-400" : "text-gray-200"}`}
                                                key={player.uid}
                                                initial={{ opacity: 0, y: 50 }}
                                                animate={{ opacity: 1, y: 0 }}
                                            >
                                                {placing[0]?.points > 0 && placing[0]?.uid === player?.uid && (
                                                    <m.div
                                                        initial={{ y: -100 }}
                                                        animate={{ y: 0 }}
                                                        exit={{ y: -100 }}
                                                        transition={{
                                                            type: "spring",
                                                            stiffness: 200,
                                                            damping: 10
                                                        }}
                                                    >
                                                        <FaCrown className="text-yellow-400" aria-label="Crown" size={25} />
                                                    </m.div>
                                                )}
                                                <h1

                                                    className={` 
                                                        transition-all duration-600 font-logo text-xl
                                                        ${placing[0]?.points > 0 && placing[0]?.uid === player?.uid ?
                                                            `${guessFireOff.includes(player.uid) ? "text-success scale-[150%] " : "scale-100 text-yellow-300"}` :
                                                            `${guessFireOff.includes(player.uid) ? "text-success scale-[150%] " : "scale-100 text-gray-200"} `}`}
                                                >
                                                    {player.name}: {player.points}
                                                </h1>
                                            </m.div>
                                        }
                                    </div>
                                </m.button>
                            ))}

                        </div>
                    </div>
                    <div className="flex flex-col items-center">
                        <m.div
                            className={`flex  gap-3 justify-center text-xl font-logo mt-2
                    ${placing[0]?.points > 0 && placing[0]?.uid === currentPlayer?.uid ? "text-yellow-300" : "text-gray-200"}
                    `}
                            layout
                        >
                            {placing[0]?.points > 0 && placing[0]?.uid === currentPlayer?.uid && (
                                <m.div
                                    initial={{ y: -100 }}
                                    animate={{ y: 0 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 100,
                                        damping: 10
                                    }}
                                >
                                    <FaCrown className="text-yellow-400" aria-label="Crown" size={25} />
                                </m.div>
                            )}
                            <h1 className="text-2xl">
                                {currentPlayer?.name} : {currentPlayer?.points}
                            </h1>
                        </m.div>
                        <h1 className={`font-logo font-bold text-2xl animate-pulse ${room.customWords ? "text-primary" : "text-success"}`}>{room.customWords ? "Custom" : "Regular"}</h1>
                    </div>
                </header >


                <div className="flex  flex-col mt-2 items-center h-full ">
                    <div className=" flex justify-center mb-5 2xl:mb-10">
                        <AnimatePresence>
                            <m.div
                                animate={{ opacity: winner ? 0 : 1 }}
                                transition={{
                                    duration: 0.5,
                                    delay: winner ? 4.8 : .5,
                                }}
                            >
                                <Grid answer={`${answers[round]}`.toUpperCase() || ""} />
                            </m.div>
                        </AnimatePresence>
                    </div>
                    <div className={` flex justify-center mb-5 ${width < 400 && "scale-[93.5%]"}`}>
                        <KeyBoard handleEnter={() => handleEnter()} hasGuessed={hasGuessed} answer={`${answers[round]}`.toUpperCase()} />
                    </div>
                </div>
                <AnimatePresence>
                    {winner && winner.uid !== uid &&
                        <m.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center backdrop-blur-xl"
                        >
                            <h1 className="text-4xl font-bold text-white">Round Over </h1>
                        </m.div>
                    }
                </AnimatePresence>
            </div >
        </RoomStatusHandler >
    );
}


