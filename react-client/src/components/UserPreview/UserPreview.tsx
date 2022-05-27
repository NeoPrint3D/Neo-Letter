import { AnimatePresence, m } from "framer-motion";
import { memo } from "react";
import { FaSquare } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { getGuessStatuses } from "../Grid/utils/getStatuses";

function UserPreview({ selectedId, selectedPlayer, room, setSelectedId, width }: { selectedId: string, selectedPlayer: Player, room: Room, setSelectedId: any, width: number }) {
    return (
        <AnimatePresence>
            {selectedId &&
                (<div className="flex justify-center items-center fixed h-screen w-screen">
                    <m.div
                        className={`grid grid-rows-6 bg-gray-500/30 backdrop-blur-xl p-4 rounded-3xl w-[75%] ${width > 600 ? "h-[75%]" : "h-[50%]"} shadow-2xl`}
                        layoutId={selectedId}
                    >
                        <div>
                            <div className="grid grid-cols-5 h-full">
                                <div></div>
                                <div className="flex items-end justify-center col-span-3 text-white">
                                    <h1 className="text-center text-4xl font-bold">{selectedPlayer.name}</h1>
                                </div>
                                <div className="flex items-start justify-end w-full ">
                                    <button className="z-50" onClick={() => setSelectedId("")} >
                                        <IoClose size={45} />
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
                                                ${status === "absent" && "text-gray-700"}`}
                                                    />
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
                </div>)}
        </AnimatePresence>
    )
}
export default memo(UserPreview)