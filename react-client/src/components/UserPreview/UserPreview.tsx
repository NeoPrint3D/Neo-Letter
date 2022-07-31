import { AnimatePresence, m } from "framer-motion";
import { memo } from "react";
import { FaSquare } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { getGuessStatuses } from "../Grid/utils/getStatuses";

function UserPreview({ selectedId, selectedPlayer, room, setSelectedId, width, height }: { selectedId: string, selectedPlayer: GamePlayer, room: Room, setSelectedId: any, width: number, height: number }) {
    return (
        <AnimatePresence>
            {selectedId &&
                <>
                    <m.div
                        className=" fixed backdrop-blur-lg bg-black/20 z-[5]  h-screen w-screen  "
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />
                    <div className="flex fixed  justify-center items-center top-0  h-screen w-screen z-20 ">
                        <m.div
                            className={`grid grid-rows-6 bg-gray-500/30 backdrop-blur-xl  z-10 p-4 rounded-3xl w-[75%] lg:w-[40%] ${width > 600 ? "h-[75%]" : "h-[50%]"} shadow-2xl `}
                            initial={{ scale: 0, y: -height / 2 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{
                                y: {
                                    type: "spring",
                                    stiffness: 200,
                                    damping: 10,
                                    duration: 0.2
                                },
                                scale: {
                                    type: "easeInOut",
                                    duration: 0.4
                                },
                            }}

                        >
                            <div>
                                <div className="grid grid-cols-5 h-full">
                                    <div />
                                    <div className="flex items-end justify-center col-span-3 text-white">
                                        <h1 className="text-center text-4xl font-bold">{selectedPlayer.name}</h1>
                                    </div>
                                    <div className="flex items-start justify-end w-full ">
                                        <button className="z-50" onClick={() => setSelectedId("")}>
                                            <IoClose className="text-white" size={45} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col justify-center items-center row-span-4">
                                <div className="flex flex-col mt-5">
                                    {selectedPlayer.guesses.map((guess, i) => ((
                                        <div key={i} className="grid grid-cols-5">
                                            {getGuessStatuses(guess, `${room.answers[room.round]}`.toUpperCase()).map((status, j) => (
                                                <div key={j} className="flex justify-center ">
                                                    <div className="tooltip" data-tip={status.charAt(0).toLocaleUpperCase() + status.slice(1)}>
                                                        <FaSquare size={45} className={`text-white 
                                                ${status === "correct" && "text-success"}
                                                ${status === "present" && "text-warning"}
                                                ${status === "absent" && "text-gray-700"}`} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )))}
                                </div>
                            </div>


                            <div className="flex items-center justify-center h-auto">
                                <p className="text-2xl text-gray-300  font-logo">
                                    Points: {selectedPlayer.points}
                                </p>
                            </div>

                        </m.div>
                    </div>
                </>
            }
        </AnimatePresence>
    )
}
export default memo(UserPreview)