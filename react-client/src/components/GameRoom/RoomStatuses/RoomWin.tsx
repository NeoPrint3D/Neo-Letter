import { m } from "framer-motion";
import Confetti from "react-confetti";
import { Link } from "react-router-dom";
import { useWindowSize } from "react-use";


export default function RoomWin({ winner }: {
    winner: {
        name: string,
        points: number,
        uid: string
    },
}) {
    const { width, height } = useWindowSize()
    return (
        <>
            <div className="flex justify-center items-center min-h-screen text-white ">
                <m.div
                    className="w-full max-w-[22rem] sm:max-w-md bg-primary-dark/30 backdrop-blur-3xl  rounded-3xl px-8 pt-6 pb-8 mb-4 shadow-2xl"
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
                            <h1 className="text-4xl font-bold">{winner.name} won the game!</h1>
                            <h2 className={`text-2xl font-bold ${winner.points === 0 ? "mt-7 mb-2 " : "mt-5"} `}>With <a className={`${winner.points === 0 ? "text-red-500" : "text-green-500"}`} >{winner.points + " "}</a>points</h2>
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
            {winner.points > 0 &&
                <Confetti
                    width={width}
                    height={height}
                    wind={.001}
                    gravity={.5}
                    numberOfPieces={500}
                />
            }
        </>
    )
}