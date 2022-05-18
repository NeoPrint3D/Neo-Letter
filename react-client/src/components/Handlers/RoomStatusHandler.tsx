import ReadyLobby from '../RoomStatuses/ReadyLobby';
import { Helmet } from "react-helmet";
import { Link, useParams } from "react-router-dom";
import Loader from "../Loader";
import { useWindowSize } from "react-use";
import Confetti from "react-confetti";
import { m } from "framer-motion";
import { AuthContext } from "../../context/AuthContext";
import { useContext, useEffect, useMemo, useState } from "react";
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
    const { id } = useParams()
    const uid = useContext(AuthContext)
    const playerRef = useMemo(() => doc(firestore, "rooms", `${id}`, "players", uid), [id, uid])




    switch (roomStatus) {
        case "room_not_found":
            return (
                <RoomErrorScreen
                    description="Room not found"
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
                <ReadyLobby id={id || ""} uid={uid} players={players} />
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
            return <Loader />

    }


    function RoomErrorScreen({ description, title }: { description: string, title: string }) {
        return (
            <>
                <Helmet>
                    <title>{title}</title>
                    <meta name="description" content={description} />
                </Helmet>
                <div className="flex justify-center items-center min-h-screen">
                    <div className=" flex flex-col items-center justify-center px-20 p-5  bg-primary-dark/30 p backdrop-blur-3xl  rounded-3xl shadow-2xl">
                        <h1 className="text-4xl  font-logo text-center mb-5">{description}</h1>
                        <Link to="/">
                            <button className="btn btn-primary mt-5">Return home</button>
                        </Link>
                    </div>
                </div>
            </>
        )
    }
}  