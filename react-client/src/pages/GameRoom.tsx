import { collection, doc, getDoc, getFirestore, increment, limit, onSnapshot, orderBy, query, endAt, updateDoc, QueryDocumentSnapshot, DocumentData, limitToLast } from "firebase/firestore";
import { AnimatePresence, domMax, LazyMotion, m } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import MessageUI from "../components/MessageUI";
import MessageButton from "../components/MessageUI/components/MessageButton";
import UserPreview from "../components/UserPreview";
import { useUid } from "../context/AuthContext";
import { useGuesses, useKeyboard, useMessages } from "../context/GameContext";
import { app } from "../utils/firebase";
import Logo from "/images/assets/logo.webp";



export default function GameRoom() {
    const firestore = useMemo(() => getFirestore(app), [])
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
    const [roundGuessedReset, setRoundGuessedReset] = useState(false)
    const { showMessages, setShowMessages, allowMessages, setAllowMessages, setMessages } = useMessages()
    const [messageLoading, setMessageLoading] = useState(false)
    const { key, setKey } = useKeyboard()
    const { guesses, setGuesses } = useGuesses()
    const { height, width } = useWindowSize()
    const { id } = useParams()
    const uid = useUid()
    const roomRef = useMemo(() => doc(firestore, "rooms", `${id}`), [id])
    const playerRef = useMemo(() => doc(firestore, "rooms", `${id}`, "players", uid), [id, uid])
    const winner = useMemo(() => players.filter(p => p.guesses.includes(answers[round]?.toUpperCase()))[0], [players, answers, round])



    const handleOtherPlayersGuess = useCallback((players: GamePlayer[]) => {
        setGuessFireOff(players.filter(player => player.guessed).map(player => player.uid))
    }, [])
    const handleGuess = useCallback(async () => {
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
    const handleEveryoneGuessed = useCallback(async (players: GamePlayer[]) => {
        if (players.length === 0) return
        if (!players.every(player => player.guesses.length === 6)) return
        setRoundGuessedReset(true)
        await new Promise((resolve) => setTimeout(resolve, 1750))

        await updateDoc(doc(firestore, "rooms", `${id}`, "players", uid), { guesses: [] })
        if (currentPlayer.role === "creator") {
            console.log("updated everything")
            await updateDoc(roomRef, { round: increment(1) })
        }
        setFireOff(true)
        await new Promise(resolve => setTimeout(resolve, 300))
        setFireOff(false)
        setGuesses([])
        setKey("")
        setRoundGuessedReset(false)
    }, [players])
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
    const handleRoomStatus = useCallback(async () => {
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
    }, [room, players, round, answers, currentPlayer])
    useEffect(() => {
        const unsub1 = onSnapshot(collection(firestore, "rooms", `${id}`, "players"), async (playersRes) => {
            const players = playersRes.docs.map((doc) => { return { ...doc.data() } }) as GamePlayer[]

            handleEveryoneGuessed(players)
            handleOtherPlayersGuess(players)

            setPlayers(players)
            setPlacing(players.filter((p) => p.points > 0).length > 0 ? players.sort((a, b) => b.points! - a.points!) : [])
            setCurrentPlayer(players.find((p) => p.uid === uid) as GamePlayer)
            setGuesses(players.find(p => p.uid === uid)?.guesses as string[])
        })
        const unsub2 = onSnapshot(roomRef, (roomRes) => {
            const room = roomRes.data()
            if (!room) { setRoomStatus("room_not_found"); return }
            setAllowMessages(room.allowMessages)
            setRoom(room as Room)
            setAnswers(room.answers)
            setRound(room.round)

        })
        return () => {
            unsub1()
            unsub2()
        }
    }, [])

    useEffect(() => {
        const unsub3 = onSnapshot(query(collection(firestore, "rooms", `${id}`, "messages"), orderBy("reversedCreatedAt", "desc"), limitToLast(20)), (messagesRes) => {
            if (!room.allowMessages) { setShowMessages(false); return }
            setMessages(messagesRes.docs.map((doc) => doc.data()) as Message[])
        })
        return () => unsub3()
    }, [room.allowMessages])

    useEffect(() => {
        if (roundGuessedReset) toast.warning("Everyone has guessed.", { theme: "dark" })
    }, [roundGuessedReset])
    useEffect(() => {
        handleRoomWin(players)
    }, [answers, players])
    useEffect(() => {
        handleRoomStatus()
    }, [room, players, round, answers, currentPlayer])


    return (
        <LazyMotion features={domMax}>
            <MessageUI players={players} room={room} />
            <UserPreview selectedId={selectedId} height={height} selectedPlayer={selectedPlayer} room={room} setSelectedId={setSelectedId} width={width} />
            <RoomStatusHandler
                winner={{
                    name: placing[0]?.name || "No one won",
                    points: placing[0]?.points || 0,
                    uid: placing[0]?.uid
                }}
                players={players}
                roomStatus={roomStatus} >
                <Helmet>
                    <title>Neo Letter | Room {id}</title>
                    <meta name="description" content={`Room ${id} is where the paty is at`} />
                </Helmet>

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
                            <div className="flex sm:gap-3 items-center justify-end mr-3">
                                <MessageButton />
                                <div className="tooltip tooltip-bottom" data-tip={"Share?"}>
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
                        <div className="flex items-center h-[4.25rem] border-white/20 border-y-4  ">
                            <div className="flex items-center  scroll-hidden h-full w-full ">
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
                                        className="w-fit"
                                    >
                                        <div>
                                            {selectedId !== player.uid &&
                                                <m.div
                                                    className={`flex  items-center gap-2 carousel-item mx-5 py-2 px-3 rounded transition-all duration-500  bg-gray-400/10  backdrop-blur-md border-b-4  
                                                    ${placing[0]?.uid === player.uid ? "text-yellow-400 shadow-lg shadow-yellow-200" : "border-primary"}   ${placing[0]?.uid === player?.uid ? "border-yellow-400" : "text-gray-200"}
                                                    ${player.guesses.length === 6 && "text-gray-200 line-through  decoration-[6px]  decoration-primary-dark/90 tooltip first:tooltip-right tooltip-bottom tooltip-error hover:z-50 "}
                                                    `}
                                                    data-tip={"They have used all their guesses."}
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
                            <KeyBoard handleEnter={() => handleGuess()} hasGuessed={hasGuessed} answer={`${answers[round]}`.toUpperCase()} />
                        </div>
                    </div>
                    <AnimatePresence>
                        {(roundGuessedReset || (winner && winner.uid !== uid)) &&
                            <m.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center backdrop-blur-xl"
                            >
                                <h1 className="text-4xl font-bold text-white">Round Over</h1>
                            </m.div>
                        }
                    </AnimatePresence>
                </div >
            </RoomStatusHandler >
        </LazyMotion>
    );
}


