import { Helmet } from "react-helmet";
import { Link, useParams } from "react-router-dom";
import { Loading } from "../Loader/Loading";
import { useWindowSize } from "react-use";
import Confetti from "react-confetti";
import { AnimatePresence, LayoutGroup, m } from "framer-motion";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { BsCheckLg } from "react-icons/bs"
import { AuthContext } from "../../context/AuthContext";
import { useContext, useMemo } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { firestore } from "../../utils/firebase";

interface RoomProps {
    children: any,
    roomStatus: RoomStatuses,
    //define winner with two attributes: winner and winnerPoints
    winner: {
        name: string,
        points: number
    },
    players: Player[]
}

export default function RoomStatusHandler({ children, roomStatus, winner, players }: RoomProps) {
    const { height, width } = useWindowSize()
    const uid = useContext(AuthContext)
    const { id } = useParams()
    const playerRef = useMemo(() => doc(firestore, "rooms", `${id}`, "players", uid), [id, uid])



    async function handleReady() {
        await updateDoc(playerRef, {
            ready: true
        })
    }
    switch (roomStatus) {
        case "room_not_found":
            return (
                <RoomErrorScreen
                    description="This Room does not exists"
                    title="Room not found"
                />
            )
        case "user_not_found":
            return (
                <RoomErrorScreen
                    description="You are not part of this room"
                    title="User not found"
                />
            );
        case "room_full":
            return (
                <RoomErrorScreen
                    title="Room full"
                    description="The room you are looking for is full"
                />
            );
        case "room_started":
            return (
                <RoomErrorScreen
                    title="Room started"
                    description="The room you are looking for has already started"
                />
            );
        case "players_not_ready":
            return (
                <LayoutGroup>
                    <div className="min-h-screen w-screen flex justify-center items-center">
                        <m.div
                            className="flex flex-col justify-center sm:w-full px-20 sm:max-w-lg bg-primary-dark/30 backdrop-blur-3xl  rounded-3xl p-5 shadow-2xl"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{
                                duration: 1
                            }}
                            layout
                        >
                            <div className="flex flex-col items-center mb-5">
                                <h1 className="text-4xl font-logo">Ready Up</h1>
                                <h2 className="mt-3 text-xl">Room: {id}</h2>
                            </div>
                            <AnimatePresence>
                                {players.map((player, i) => (
                                    <m.div
                                        key={player.uid}
                                        className="flex shadow-input rounded-xl p-3 sm:p-5 items-center"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 100,
                                            damping: 10,
                                            delay: i * 0.25,
                                        }}
                                    >
                                        <div className="flex justify-start w-full ">
                                            <p className="font-logo text-3xl">{player.name}</p>
                                        </div>
                                        <div className="flex justify-end">
                                            {player.ready ? <BsCheckLg className="text-success" size={30} /> : <AiOutlineLoading3Quarters className="animate-spin" size={30} />}
                                        </div>
                                    </m.div>)
                                )}
                            </AnimatePresence>
                            <div className="flex justify-center mt-5">
                                <button
                                    className="btn btn-success btn-md sm:btn-lg"
                                    onClick={handleReady}
                                >
                                    Ready
                                </button>
                            </div>
                        </m.div>
                    </div>
                </LayoutGroup>
            )
        case "room_finished":
            return (
                <>
                    <div className="flex justify-center items-center min-h-screen ">
                        <m.div
                            className="w-full max-w-sm sm:max-w-md bg-primary-dark/30 backdrop-blur-3xl  rounded-3xl px-8 pt-6 pb-8 mb-4 shadow-2xl"
                            initial={{ scale: 0, y: "100%" }}
                            animate={{ scale: 1, y: 0 }}
                            transition={{
                                type: "spring",
                                stiffness: 100,
                                damping: 10
                            }}
                        >
                            <div className="flex flex-col items-center justify-center">
                                {winner && <div className="text-center">
                                    <h1 className="text-3xl font-bold">{winner.name} won the game!</h1>
                                    <h2 className="text-2xl font-bold">With {winner.points} points</h2>
                                </div>}
                                <div className="text-center">
                                    <Link to="/">
                                        <button className="mt-5"                                        >
                                            <h1 className="text-3xl font-logo text-primary underline">Back to Home</h1>
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </m.div>
                    </div >
                    <Confetti
                        width={width}
                        height={height}
                        wind={.001}
                        gravity={.5}
                        numberOfPieces={500}
                    />
                </>
            )
        case "exists":
            return children;
        default:
            return <Loading />

    }

    function RoomErrorScreen({ description, title }: { description: string, title: string }) {
        return (
            <>
                <Helmet>
                    <title>{title}</title>
                    <meta name="description" content={description} />
                </Helmet>
                <div className="flex justify-center items-center min-h-screen">
                    <m.div
                        className=" flex flex-col gap-5 justify-center items-center w-full max-w-sm bg-transparent rounded p-10 shadow-2xl"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                            type: "spring",
                            stiffness: 100,
                            damping: 10,
                        }}
                    >
                        <h1 className="text-2xl font-bold font-logo text-center">{description}</h1>
                        <Link to="/">
                            <h1 className="text-xl font-logo link link-primary">Return home</h1>
                        </Link>
                    </m.div>
                </div>
            </>
        )
    }
}  