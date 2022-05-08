import { AnimatePresence } from "framer-motion";
import { useContext } from "react";
import { KeyboardContext } from "../../../context/GameContext";
import Cell from "../Cell";




export default function CurrentRow() {
    const keypress = useContext(KeyboardContext);
    const displayLetters = [...keypress.split(""), ...Array(5 - keypress.split("").length).fill("")];




    return (
        <div className="grid grid-cols-5 gap-1">
            {displayLetters.map((letters, index) => (
                <Cell key={index} keypress={letters} />
            ))}
        </div>
    )
}
