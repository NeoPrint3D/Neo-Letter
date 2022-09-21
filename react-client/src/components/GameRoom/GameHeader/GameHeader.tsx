import { AnimatePresence, m } from "framer-motion"
import { memo, useMemo, useState } from "react"
import { FaCrown } from "react-icons/fa"
import { FiShare } from "react-icons/fi"
import { Link, useParams } from "react-router-dom"
import { useWindowSize } from "react-use"
import { RWebShare } from "react-web-share"
import { useUid } from "../../../context/AuthContext"
import MessageButton from "../../MessageUI/components/MessageButton"
import UserPreview from "../UserPreview"
import Logo from "/images/assets/logo.webp";


function GameHeader({ room, players, fireOff, placing, guessFireOff }: { room: Room, players: GamePlayer[], fireOff: boolean, placing: GamePlayer[], guessFireOff: string[] }) {
    const [selectedPlayer, setSelectedPlayer] = useState<GamePlayer>({} as GamePlayer)
    const [selectedId, setSelectedId] = useState("")
    const uid = useUid()
    const { id } = useParams()
    const currentPlayer = useMemo(() => players.find(p => p.uid === uid) as GamePlayer, [players])
    const { width, height } = useWindowSize()

    return (
        <>
            <UserPreview selectedId={selectedId} height={height} selectedPlayer={selectedPlayer} room={room} setSelectedId={setSelectedId} width={width} /><header>
                <div className="grid grid-cols-3">
                    <div className="flex justify-start items-center">
                        <Link to="/">
                            <img src={Logo} alt="logo" className="translate-y-1 scale-90"
                                height={40}
                                width={120} />
                        </Link>
                    </div>
                    <div className="flex flex-col justify-center items-center font-logo">
                        <div className="flex text-xl gap-2">
                            <p>Round</p>
                            <AnimatePresence>
                                {fireOff ?
                                    <m.p
                                        initial={{ scale: 0, y: 50 }}
                                        animate={{ scale: [3, 1], y: 0 }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 100,
                                            damping: 10
                                        }}>{room.round + 1}/{room.answers.length}</m.p> : <p>{room.round + 1}/{room.answers.length}</p>}
                            </AnimatePresence>
                        </div>
                        <h1 className=" text-xl font-sans select-text font-semisbold">ID: {id}</h1>
                    </div>
                    <div className="flex gap-3 sm:gap-5 items-center justify-end mr-3">
                        <MessageButton />
                        <div className="tooltip tooltip-bottom" data-tip={"Share?"}>
                            <RWebShare
                                data={{
                                    title: `Join room ${id}`,
                                    text: `${currentPlayer?.name} sent you a request to join room ${id}`,
                                    url: `${import.meta.env.DEV ? `http://localhost:3005/join?id=${id}` : `https://neo-letter.web.app/join?id=${id}`}`,
                                }}>
                                <button className=" transition-all duration-300 flex justify-center  items-center rounded-full p-3 bg-primary text-white active:scale-90">
                                    <FiShare size={25} />
                                </button>
                            </RWebShare>
                        </div>
                    </div>
                </div>
                <div className="overflow-scroll">
                    <div className="flex items-center gap-5 h-[4.25rem] min-w-max border-white/20 border-y-4 ">
                        {players && players.filter((p) => p.uid !== uid).map((player) => (
                            <m.button
                                key={player.uid}
                                transition={{
                                    layout: {
                                        type: "easeInOut",
                                        duration: 0.5
                                    }
                                }}
                                layout
                                onClick={() => {
                                    setSelectedId(player.uid)
                                    setSelectedPlayer(player)
                                }}
                                className="first:ml-[.625rem] last:mr-[.625rem]"
                            >
                                {selectedId !== player.uid &&
                                    <m.div
                                        className={`flex  items-center gap-2 carousel-item py-2 px-3 rounded transition-all duration-500  bg-gray-400/10  backdrop-blur-md border-b-4 w-fit 
                                    ${placing[0]?.uid === player.uid ? "text-yellow-400 shadow-lg shadow-yellow-200" : "border-primary"}   ${placing[0]?.uid === player?.uid ? "border-yellow-400" : "text-gray-200"}
                                    ${player.guesses.length === 6 && "text-gray-200 line-through  decoration-[6px]  decoration-primary-dark/90 tooltip first:tooltip-right tooltip-bottom tooltip-error hover:z-50 "}
                                    `}
                                        data-tip={"They have used all their guesses."}
                                        key={player.uid}
                                        initial={{ opacity: 0, y: 50 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        {placing[0]?.points > 0 && placing[0]?.uid === player?.uid && (
                                            <m.div
                                                initial={{ y: -100 }}
                                                animate={{ y: 0 }}
                                                exit={{ y: -100 }}
                                                transition={{
                                                    type: "spring",
                                                    stiffness: 200,
                                                    damping: 10
                                                }}
                                            >
                                                <FaCrown className="text-yellow-400" aria-label="Crown" size={25} />
                                            </m.div>
                                        )}
                                        <h1
                                            className={` 
                                        transition-all duration-600 font-logo text-xl
                                        ${placing[0]?.points > 0 && placing[0]?.uid === player?.uid ?
                                                    `${guessFireOff.includes(player.uid) ? "text-success scale-[150%] " : "scale-100 text-yellow-300"}` :
                                                    `${guessFireOff.includes(player.uid) ? "text-success scale-[150%] " : "scale-100 text-gray-200"} `}`}
                                        >
                                            {player.name}: {player.points}
                                        </h1>
                                    </m.div>}
                            </m.button>
                        ))}
                    </div>

                </div>
                <div className="flex flex-col items-center">
                    <m.div
                        className={`flex  gap-3 justify-center text-xl font-logo mt-2
    ${placing[0]?.points > 0 && placing[0]?.uid === currentPlayer?.uid ? "text-yellow-300" : "text-gray-200"}
    `}
                        layout
                    >
                        {placing[0]?.points > 0 && placing[0]?.uid === currentPlayer?.uid && (
                            <m.div
                                initial={{ y: -100 }}
                                animate={{ y: 0 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 100,
                                    damping: 10
                                }}
                            >
                                <FaCrown className="text-yellow-400" aria-label="Crown" size={25} />
                            </m.div>
                        )}
                        <h1 className="text-2xl">
                            {currentPlayer?.name}: {currentPlayer?.points}
                        </h1>
                    </m.div>
                    <h1 className={`font-logo font-bold text-2xl animate-pulse ${room.customWords ? "text-primary" : "text-success"}`}>{room.customWords ? "Custom" : "Regular"}</h1>
                </div>
            </header>
        </>

    )
}

export default memo(GameHeader)