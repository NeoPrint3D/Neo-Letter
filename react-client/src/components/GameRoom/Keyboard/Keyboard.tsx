import { doc, getFirestore, updateDoc } from "firebase/firestore";
import { m } from "framer-motion";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { AiFillDelete } from "react-icons/ai";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useUid } from "../../../context/AuthContext";
import { useGuesses, useKeyboard } from "../../../context/GameContext";
import { app } from "../../../utils/firebase";
import { CharStatus } from "../Grid/utils/getStatuses";
import Key from "./Key";

function Keyboard({ room }: { room: Room }) {
    const firestore = useMemo(() => getFirestore(app), [])
    const [hasGuessed, setHasGuessed] = useState(false)
    const [statuses, setStatuses] = useState<{ [key: string]: CharStatus }>({})
    const { guesses, setGuesses } = useGuesses()
    const { key, setKey } = useKeyboard()
    const answer = room.answers[room.round].toUpperCase()
    const { id } = useParams()
    const uid = useUid()


    const handleEnter = useCallback(async () => {
        if (key.length !== 5) return
        const playerRef = doc(firestore, "rooms", `${id}`, "players", uid)
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

    useEffect(() => {
        handlekeyboardStatuses()
    }, [guesses])

    const handlekeyboardStatuses = useCallback(() => {
        const letterDict: { [key: string]: CharStatus } = {}
        const soloutionLetters = answer.split("")
        guesses.forEach((guess: string) => {
            guess.split("").forEach((letter, j) => {
                if (letterDict[letter] !== undefined && guess[j] === answer[j]) {
                    letterDict[letter] = "correct"
                    return
                }
                if (!soloutionLetters.includes(letter)) {
                    letterDict[letter] = "absent"
                    return
                }
                if (letterDict[letter] === undefined && guess[j] !== answer[j]) {
                    letterDict[letter] = "present"
                    return
                }
                if (guess[j] === answer[j]) {
                    letterDict[letter] = "correct"
                    return
                }
            })
        })
        setStatuses(letterDict)
    }, [guesses])

    return (
        <div className="flex flex-col mx-2">
            <div className="flex justify-center mb-[0.1875rem] gap-[0.1875rem]">
                {['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'].map((key) => (
                    <Key
                        value={key}
                        key={key}
                        status={statuses[key]}
                    />
                ))}
            </div>
            <div className="flex justify-center mb-[0.1875rem] gap-[0.1875rem]">
                {['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'].map((key) => (
                    <Key
                        value={key}
                        key={key}
                        status={statuses[key]}
                    />
                ))}
                <button onClick={() => setKey("")} className="transition-colors shadow-key duration-300 px-0.5 py-4 bg-primary hover:bg-red-400 active:bg-red-600 rounded text-white ">
                    <AiFillDelete size={30} />
                </button>
            </div>
            <div className="flex justify-center gap-[0.1875rem]">
                <m.button
                    className=" transition-colors duration-300 px-3 py-4 bg-primary hover:bg-red-400 active:bg-red-600 rounded shadow-key text-white disabled:bg-primary/40 "
                    whileHover={{ scale: 1.025 }}
                    whileTap={{ scale: 0.975 }}
                    onClick={handleEnter}
                    disabled={hasGuessed || guesses.length === 6 || `${key}`.length < 5}
                >
                    Enter
                </m.button>

                {['Z', 'X', 'C', 'V', 'B', 'N', 'M'].map((key) => (
                    <Key
                        value={key}
                        key={key}
                        status={statuses[key]}
                    />
                ))}
                <m.button
                    className="transition-colors shadow-key duration-300 px-3 py-4 bg-primary hover:bg-red-400 active:bg-red-600 rounded text-white "
                    whileHover={{ scale: 1.025 }}
                    whileTap={{ scale: 0.975 }}
                    onClick={() => setKey(key.slice(0, -1))}
                >
                    Delete
                </m.button>
            </div>
        </div>
    )
}


export default memo(Keyboard)

