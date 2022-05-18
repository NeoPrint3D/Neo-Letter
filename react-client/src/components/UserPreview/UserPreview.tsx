import { AnimatePresence, m } from "framer-motion";
import { memo } from "react";
import { FaSquare } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { getGuessStatuses } from "../Grid/utils/getStatuses";

function UserPreview({ selectedId, selectedPlayer, room, setSelectedId }: { selectedId: string, selectedPlayer: Player, room: Room, setSelectedId: any }) {

    return (
        <AnimatePresence>
            {selectedId &&
                (<div className="flex justify-center items-center fixed h-screen w-screen">
                    <m.div
                        className="flex flex-col bg-gray-200/10 backdrop-blur-xl p-4 rounded-3xl h-[75%] w-[75%] shadow-2xl"
                        layoutId={selectedId}
                    >
                        <div className="grid grid-cols-5">
                            <div></div>
                            <div className="flex justify-center col-span-3 text-white">
                                <h1 className="text-center text-3xl font-bold">{selectedPlayer.name}</h1>
                            </div>
                            <div className="flex justify-end w-full ">
                                <button className=" transition-shadow duration-700 text-white hover:shadow-xl p-2 rounded-full" onClick={() => setSelectedId("")} >
                                    <IoClose size={30} />
                                </button>
                            </div>
                        </div>
                        <div className="flex justify-center mt-1">
                            <p className="text-2xl text-white font-logo">
                                Points: {selectedPlayer.points}
                            </p>
                        </div>
                        <div className="flex flex-col items-center  mt-5">
                            {selectedPlayer.guesses.map((guess, i) => ((
                                <div key={i} className="grid grid-cols-5 ">
                                    {getGuessStatuses(`${room.answers[room.round]}`.toUpperCase() as string, guess).map((status, j) => (
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

                    </m.div>
                </div>)}
        </AnimatePresence>
    )
}


export default memo(UserPreview)