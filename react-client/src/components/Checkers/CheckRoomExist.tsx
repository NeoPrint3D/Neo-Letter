import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { Loading } from "../Loader/Loading";
import { useWindowSize } from "react-use";
import Confetti from "react-confetti";

interface RoomProps {
    children: any,
    roomStatus: "exists" | "room_not_found" | "user_not_found" | "room_full" | undefined,
    round: number,
    answersLength: number,
   //define winner with two attributes: winner and winnerPoints
    winner: {
        name: string,
        points: number
    }
}

export default function CheckRoomExist({ children, roomStatus, round, answersLength, winner }: RoomProps) {
    const { height, width } = useWindowSize()
    if (round >= answersLength && answersLength > 0) {
        return (
            <>
                <div className="flex justify-center items-center min-h-screen ">
                    <div className="w-full max-w-sm sm:max-w-md bg-primary-dark/30 backdrop-blur-3xl  rounded-3xl px-8 pt-6 pb-8 mb-4 shadow-2xl">
                        <div className="flex flex-col items-center justify-center">
                            {winner && <div className="text-center">
                                <h1 className="text-3xl font-bold">{winner.name} won the game!</h1>
                                <h2 className="text-2xl font-bold">With {winner.points} points</h2>
                            </div>}
                            <div className="text-center">
                                <Link to="/">
                                    <button className="mt-5">
                                        <h1 className="text-3xl font-logo text-primary underline">Back to Home</h1>
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
                <Confetti
                    width={width}
                    height={height} />
            </>
        )
    }
    switch (roomStatus) {
        case "exists":
            return children;
        case "room_not_found":
            return (
                <RoomErrorScreen
                    description="The room you are looking for does not exist"
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
                    <div className=" flex flex-col gap-5 justify-center items-center w-full max-w-sm bg-transparent rounded p-10 shadow-2xl">
                        <h1 className="text-2xl font-bold font-logo text-center">{description}</h1>
                        <Link to="/">
                            <h1 className="text-xl font-logo link link-primary">Return home</h1>
                        </Link>
                    </div>
                </div>
            </>
        )
    }
}  