import { AnimatePresence } from "framer-motion";
import { memo, useContext, useMemo } from "react";
import { GuessesContext } from "../../context/GameContext";
import CurrentRow from "./Rows/CurrentRow";
import { EmptyRow } from "./Rows/EmptyRow";
import FilledRow from "./Rows/FilledRow";

function Grid({ answer }: { answer: string }) {
    const guesses = useContext(GuessesContext)
    const empties = useMemo(() => guesses?.length < 5 ? Array.from(Array(5 - guesses.length)) : [], [guesses])
    return (
        <div className="flex justify-center">
            <div className="grid grid-rows-6 gap-1.5">
                {guesses.map((guess: string, i: number) => (
                    <FilledRow key={i} answer={answer} guess={guess} />
                ))}

                {guesses.length < 6 && (
                    <CurrentRow />
                )}
                {empties.map((_, i) => (
                    <EmptyRow key={i} />
                ))}
            </div>
        </div>
    );
}

export default memo(Grid);
