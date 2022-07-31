import { AnimatePresence, m, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getGuessStatuses, } from "../utils/getStatuses";



export default function FilledRow({ guess, answer }: { guess: string, answer: string }) {
    const [status, setStatus] = useState<string[]>([]);
    const [isCorrect, setIsCorrect] = useState(false);
    const guessList = guess.split("")
    useEffect(() => {
        setStatus(getGuessStatuses(guess, answer))
        setIsCorrect(answer === guess)
    }, [guess])

    return (
        <div className="grid grid-cols-5 gap-1">
            {guessList.map((letter, index) => (
                <motion.div
                    initial={{
                        scale: 0.9,
                        rotateY: 90,
                    }}
                    animate={{
                        scale: isCorrect ? [1, .9, 1] : 1,
                        rotateY: 0,
                        y: isCorrect ? [0, -40, 40, -40, 0] : 0,
                    }}
                    exit={{
                        opacity: 0,
                    }}
                    transition={{
                        scale: {
                            type: "spring",
                            stiffness: 100,
                            damping: 10,
                            duration: 0.5,
                            delay: isCorrect ? 0.5 * index + 2 : .3 * index,
                        },
                        rotateY: {
                            type: "spring",
                            stiffness: 100,
                            damping: 10,
                            delay: isCorrect ? 0.5 * index : .3 * index,
                        },
                        y: {
                            type: "tween",
                            delay: index * 0.35 + 1.5,
                            stiffness: 100,
                            damping: 10,
                            duration: 0.5,
                            repeat: 2
                        }
                    }}
                    key={index}
                    className={`
                                h-12 w-12 sm:h-14 sm:w-14 rounded flex justify-center items-center text-3xl text-white 
                                ${status[index] === "correct" && "bg-success"}
                                ${status[index] === "present" && "bg-warning"}
                                ${status[index] === "absent" && "bg-gray-500"}
                                ${!(status[index]) && "border-2 border-gray-500"}
                            `}>
                    {letter?.toLocaleUpperCase()}
                </motion.div>
            ))}
        </div>
    )
}