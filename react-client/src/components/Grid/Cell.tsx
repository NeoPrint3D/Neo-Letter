import { m, domAnimation, LazyMotion, AnimatePresence } from 'framer-motion';
import { memo } from 'react';
//status by default is empty

function Cell({ keypress, status = 'empty' }: { keypress?: string; status?: "empty" | "correct" | "incorrect" | "incorrectPosition"; }) {
    return (
        <div className={`h-[3.25rem] w-[3.25rem] sm:h-14 sm:w-14 rounded flex justify-center items-center
        ${status === "correct" && "bg-success"}
        ${status === "incorrect" && "bg-gray-500"}
        ${status === "incorrectPosition" && "bg-warning"}
        ${status === "empty" && "border-[.175rem] border-gray-400"}
        `}>
            <AnimatePresence>
                {keypress && (
                    <m.p className="text-3xl"
                        initial={{ scale: .5, opacity: .8, }}
                        animate={{ scale: 1, opacity: 1, }}
                        exit={{ scale: 0, opacity: 0, }}
                        transition={{
                            type: "tween",
                            duration: 0.15,
                            ease: "easeInOut",
                        }}>
                        {keypress?.toLocaleUpperCase()}
                    </m.p>
                )}
            </AnimatePresence>
        </div >
    );
}

export default memo(Cell);
