import { Dispatch, useContext, useEffect, useState } from "react"
import { AiFillHome, AiFillTrophy } from "react-icons/ai"
import { BsPersonFill } from "react-icons/bs"
import { Link, useLocation } from "react-router-dom"
import { useWindowSize } from "react-use"
import { UserContext } from "../../context/AuthContext"


export default function BottomNavbar() {
    const location = useLocation()
    const [navSelect, setNavSelect] = useState(location.pathname === "/" ? "home" : location.pathname.split("/")[1])
    const user = useContext(UserContext)
    const { width } = useWindowSize()

    useEffect(() => { if (!["/", "/profile", "/leaderboard"].includes(location.pathname)) setNavSelect("") }, [location.pathname])
    return !location.pathname.includes("/room") ? (
        <div className={`flex justify-center  w-screen  ${width < 640 ? "bottom-0 fixed" : "top-0 absolute"}`}>
            <div className={`flex items-center h-24 z-[10000]`}>
                <div
                    className={`grid grid-cols-3 items-center w-96 ${width < 640 ? "bg-primary-dark/30 backdrop-blur-3xl rounded-3xl shadow-input mb-5 h-20" : ""}`}
                >
                    <Link to="/">
                        <div
                            className={`flex flex-col justify-center items-center transition-all duration-300 ease-in-out
                            ${navSelect === "home" ? "text-white scale-110" : "text-gray-400 scale-100"}
                            `}
                            onClick={() => setNavSelect("home")}
                        >
                            <AiFillHome size={40} />
                            <p className='text-xl'>Home</p>
                        </div>
                    </Link>

                    <Link to="/leaderboard">
                        <div
                            className={`flex flex-col justify-center items-center transition-all duration-300 ease-in-out
                            ${navSelect === "leaderboard" ? "text-white scale-110" : "text-gray-400 scale-100"}
                            `}
                            onClick={() => setNavSelect("leaderboard")}
                        >
                            <AiFillTrophy size={40} />
                            <p className='text-xl'>Leaderboard</p>
                        </div>
                    </Link>



                    <Link to={`/profile/${user?.uid}`}>
                        <div
                            className={`flex flex-col justify-center items-center transition-all duration-300 ease-in-out
                            ${navSelect === "profile" ? "text-white scale-110" : "text-gray-400 scale-100"}
                            `}
                            onClick={() => setNavSelect("profile")}
                        >
                            <BsPersonFill size={40} />
                            <p className='text-xl'>Profile</p>
                        </div>
                    </Link>


                </div>
            </div>
        </div>
    ) : null
}

