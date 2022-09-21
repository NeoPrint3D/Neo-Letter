import { m } from "framer-motion";
import { memo, useCallback, useContext } from "react";
import { useWindowSize } from "react-use";
import { useKeyboard, useGuesses } from "../../../context/GameContext";
import { CharStatus } from "../Grid/utils/getStatuses";

function Key({ value, status }: { value?: string, status?: CharStatus, socket?: any }) {
    const { width } = useWindowSize()
    const { key, setKey } = useKeyboard()
    const { guesses } = useGuesses()


    const handleClick = useCallback(async () => {
        if (key.length < 5 && (guesses === undefined || guesses.length < 6)) {
            setKey(key + value)
        }
    }, [key])

    return (
        <m.button
            className={`
                text-white
                transition-colors rounded py-4 px-3 
                2xl:text-3xl
                ${status ? `duration-1000 delay-1000
                ${status === "correct" && "bg-success"}
                ${status === "present" && "bg-warning"}
                ${status === "absent" && "bg-gray-700/60"}` :
                    `bg-[#9294a3] active:bg-slate-600 first:px-3.5 last:px-3.5
                    ${width > 600 && "hover:bg-gray-300"}
                    `}
                    `}
            onClick={handleClick}
            whileHover={{ scale: 1.025 }}
            whileTap={{ scale: 0.975 }}
        >
            {value}
        </m.button >
    )
}
export default memo(Key)