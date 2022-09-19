import { m, AnimatePresence } from 'framer-motion';
import { memo } from 'react';
//status by default is empty

function Cell({ keypress, status = 'empty' }: { keypress?: string; status?: "empty" | "correct" | "incorrect" | "incorrectPosition"; }) {

    return (
        <m.div className={`transitiion-all h-[3.25rem] 2xl:h-[4.5rem] 2xl:w-[4.5rem] w-[3.25rem] sm:h-14 sm:w-14 rounded flex justify-center items-center
        ${status === "correct" && "bg-success backdrop-blur-none"}
        ${status === "incorrect" && "bg-gray-500 backdrop-blur-none"}
        ${status === "incorrectPosition" && "bg-warning backdrop-blur-none"}
        ${status === "empty" && "border-[.175rem] border-white/50 bg-primary-dark/50"}
        `}>
            <AnimatePresence>
                {keypress && (
                    <m.p className="text-3xl"
                        initial={{ scale: .5, opacity: 0 }}
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
        </m.div >
    );
}

export default memo(Cell);
