import { m } from "framer-motion";
import { memo, useContext } from "react";
import { GuessesContext, KeyboardContext, KeyBoardDispatchContext } from "../../context/GameContext";
import { CharStatus } from "../Grid/utils/getStatuses";

function Key({ value, status }: { value?: string, status?: CharStatus, socket?: any }) {
    const key = useContext(KeyboardContext);
    const setKey = useContext(KeyBoardDispatchContext)

    const guesses = useContext(GuessesContext)

    const handleClick = async () => {
        if (key.length < 5 && (guesses === undefined || guesses.length < 6)) {
            setKey(key + value)
        }
    }

    return (
        <m.button
            className={`
            shadow-key
                text-white
                transition-colors rounded py-4 px-3 
                ${status ? `duration-1000 delay-1000
                ${status === "correct" && "bg-success"}
                ${status === "present" && "bg-warning"}
                ${status === "absent" && "bg-gray-700/60"}` :
                `bg-[#6a6c80] hover:bg-gray-400 active:bg-slate-600 first:px-3.5 last:px-3.5`}`}
            onClick={handleClick}
            whileHover={{ scale: 1.025 }}
            whileTap={{ scale: 0.975 }}
        >
            {value}
        </m.button >
    )
}
export default Key