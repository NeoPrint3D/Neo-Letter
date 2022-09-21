import { collection, doc, getDoc, getFirestore, increment, limitToLast, onSnapshot, orderBy, query, updateDoc } from "firebase/firestore";
import { AnimatePresence, domMax, LazyMotion, m } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useWindowSize } from "react-use";
import Grid from "../components/GameRoom/Grid";
import GameHeader from "../components/GameRoom/GameHeader";
import Keyboard from "../components/GameRoom/Keyboard";
import RoomStatusHandler from "../components/Handlers/RoomStatusHandler";
import MessageUI from "../components/MessageUI";
import { useUid } from "../context/AuthContext";
import { useGuesses, useKeyboard, useMessages } from "../context/GameContext";
import { app } from "../utils/firebase";



export default function GameRoom() {
    const firestore = useMemo(() => getFirestore(app), [])
    const [roomStatus, setRoomStatus] = useState<RoomStatuses>();
    const [room, setRoom] = useState<Room>({} as Room);
    const [fireOff, setFireOff] = useState(false)
    const [players, setPlayers] = useState<GamePlayer[]>([])
    const [answers, setAnswers] = useState<string[]>([])
    const [round, setRound] = useState(0)
    const [placing, setPlacing] = useState<GamePlayer[]>([])
    const [guessFireOff, setGuessFireOff] = useState<string[]>([])
    const [hasGuessed, setHasGuessed] = useState(false)
    const [resetWinner, setResetWinner] = useState(false)
    const [roundGuessedReset, setRoundGuessedReset] = useState(false)
    const { showMessages, setShowMessages, allowMessages, setAllowMessages, setMessages } = useMessages()
    const { key, setKey } = useKeyboard()
    const { guesses, setGuesses } = useGuesses()
    const { height, width } = useWindowSize()
    const { id } = useParams()
    const uid = useUid()
    const roomRef = useMemo(() => doc(firestore, "rooms", `${id}`), [id])
    const playerRef = useMemo(() => doc(firestore, "rooms", `${id}`, "players", uid), [id, uid])
    const winner = useMemo(() => players.filter(p => p.guesses.includes(answers[round]?.toUpperCase()))[0], [players, answers, round])
    const currentPlayer = useMemo(() => players.find(p => p.uid === uid) as GamePlayer, [players])


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
                    <GameHeader room={room} players={players} fireOff={fireOff} placing={placing} guessFireOff={guessFireOff} />
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
                            <Keyboard handleEnter={() => handleGuess()} hasGuessed={hasGuessed} answer={`${answers[round]}`.toUpperCase()} />
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


