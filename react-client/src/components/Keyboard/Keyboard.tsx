import { memo, useContext, useEffect, useState } from "react";
import { GuessesContext, GuessesDispatchContext, KeyboardContext, KeyBoardDispatchContext } from "../../context/GameContext";
import Key from "./Key";
import { CharStatus, getGuessStatuses } from "../Grid/utils/getStatuses";
import { m } from "framer-motion";

function KeyBoard({ answer, handleEnter, hasGuessed }: { answer: string, handleEnter: any, hasGuessed: boolean }) {
    const [statuses, setStatuses] = useState<{ [key: string]: CharStatus }>({})
    const guesses = useContext(GuessesContext)
    const key = useContext(KeyboardContext)
    const setKey = useContext(KeyBoardDispatchContext)



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
                    className=" transition-colors duration-300 px-3 py-4 bg-primary hover:bg-red-400 active:bg-red-600 rounded shadow-key text-white disabled:bg-primary/40 "
                    whileHover={{ scale: 1.025 }}
                    whileTap={{ scale: 0.975 }}
                    onClick={handleEnter}
                    disabled={hasGuessed || guesses.length === 6 || `${key}`.length < 5}
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


export default memo(KeyBoard)

