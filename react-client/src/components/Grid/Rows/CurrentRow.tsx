import { AnimatePresence } from "framer-motion";
import { useContext } from "react";
import { KeyboardContext } from "../../../context/GameContext";
import Cell from "../Cell";




export default function CurrentRow() {
    const key = useContext(KeyboardContext);
    const displayLetters = key ? [...key.split(""), ...Array(5 - key.split("").length).fill("")] : Array(5).fill("");




    return (
        <div className="grid grid-cols-5 gap-1">
            {displayLetters.map((letters, index) => (
                <Cell key={index} keypress={letters} />
            ))}
        </div>
    )
}
