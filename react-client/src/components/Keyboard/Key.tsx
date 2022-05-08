import { m } from "framer-motion";
import { memo, useContext } from "react";
import { GuessesContext, KeyboardContext, KeyBoardDispatchContext } from "../../context/GameContext";
import { CharStatus } from "../Grid/utils/getStatuses";

function Key({ value, action, status, socket, answer }: { value?: string, action?: "Delete" | "Enter", status?: CharStatus, socket?: any, answer?: string }) {
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
                text-white
                transition-colors duration-1000 rounded py-4 px-3 delay-1000
                ${status ? `
                ${status === "correct" && "bg-success"}
                ${status === "present" && "bg-warning"}
                ${status === "absent" && "bg-gray-700/60"}` : "bg-[#6a6c80] first:px-3.5 last:px-3.5 "}`}
            onClick={handleClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}

        >
            {value}
        </m.button >
    )
}
export default memo(Key)