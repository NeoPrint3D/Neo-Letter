import { useContext, useEffect, useState } from "react";
import { GuessesContext, GuessesDispatchContext, KeyboardContext, KeyBoardDispatchContext } from "../../context/GameContext";
import Key from "./Key";
import { CharStatus, getGuessStatuses } from "../Grid/utils/getStatuses";
import { m } from "framer-motion";

export default function KeyBoard({ answer, handleEnter }: { answer: string, handleEnter: any }) {
    const guesses = useContext(GuessesContext)
    const key = useContext(KeyboardContext)
    const setKey = useContext(KeyBoardDispatchContext)


    const [statuses, setStatuses] = useState<{
        [key: string]: CharStatus;
    }>({})

    useEffect(() => {
        handlekeyboardStatuses()
    }, [guesses])



    function handlekeyboardStatuses() {
        const letterDict: { [key: string]: CharStatus } = {}
        const soloutionLetters = answer.split("")
        guesses.forEach((guess: string) => {
            guess.split("").forEach((letter, j) => {
                if (letterDict[letter] === undefined) {
                    if (soloutionLetters.includes(letter)) {
                        if (guess[j] === answer[j]) {
                            letterDict[letter] = "correct"
                        } else {
                            letterDict[letter] = "present"
                        }
                    }
                    else {
                        letterDict[letter] = "absent"
                    }
                } else {
                    if (guess[j] === answer[j]) {
                        letterDict[letter] = "correct"
                    }
                }
            })
        })
        setStatuses(letterDict)
    }

    return (
        <div className="flex flex-col mx-2">
            <div className="flex justify-center mb-[0.1875rem] gap-[0.1875rem]">
                {['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'].map((key, i) => (
                    <Key
                        value={key}
                        key={i}
                        status={statuses[key]}
                    />
                ))}
            </div>
            <div className="flex justify-center mb-[0.1875rem] gap-[0.1875rem]">
                {['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'].map((key, i) => (
                    <Key
                        value={key}
                        key={i}
                        status={statuses[key]}
                    />
                ))}
            </div>
            <div className="flex just ify-center gap-[0.1875rem]">
                <m.button
                    className="px-3 py-4 bg-primary rounded text-white "
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleEnter}
                >
                    Enter
                </m.button>

                {['Z', 'X', 'C', 'V', 'B', 'N', 'M'].map((key, i) => (
                    <Key
                        value={key}
                        key={i}
                        status={statuses[key]}
                    />
                ))}
                <m.button
                    className="px-3 py-4 bg-primary rounded text-white "
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setKey(key.slice(0, -1))}
                >
                    Delete
                </m.button>
            </div>
        </div>
    )
}

