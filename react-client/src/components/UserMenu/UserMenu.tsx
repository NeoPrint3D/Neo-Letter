import { signOut } from "firebase/auth"
import { AnimatePresence, m } from "framer-motion"
import { useCallback, useContext, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { UserContext } from "../../context/AuthContext"
import { auth } from "../../utils/firebase"

export default function UserDropDown() {

    const [open, setOpen] = useState(false)

    const user = useContext(UserContext)

    const handleBlur = useCallback((e) => {
        const currentTarget = e.currentTarget
        requestAnimationFrame(() => {
            if (!currentTarget.contains(document.activeElement)) {
                setOpen(false)
            }
        })
    }, [])

    const handleSignOut = () => {
        if (!window.confirm("Are you sure you want to sign out?")) return
        signOut(auth)
        document.cookie = "neo-letter-game-uid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }

    useEffect(() => {
        setOpen(false)
    }, [location.pathname])




    return (
        <div className="flex flex-col items-end  absolute top-0 right-0 mt-2 mr-2 z-50"
            tabIndex={0}
            onBlur={(e) => handleBlur(e)}
        >
            <button onClick={() => setOpen(!open)} >
                <div className=" flex justify-center items-center  border-4 border-transparent hover:border-white/70 duration-500 transition-colors h-16 w-16  rounded-full" >
                    <img src={user?.profilePic} alt="user" className="rounded-full h-14 w-14 " referrerPolicy="no-referrer" />
                </div>
            </button>

            <AnimatePresence>
                {open && (
                    <m.ul
                        className="bg-primary-dark/30 backdrop-blur-3xl w-40 mt-1 p-2 rounded-xl"
                        initial={{ scale: 0, x: 50 }}
                        animate={{ scale: 1, x: 0 }}
                        exit={{ scale: 0 }}
                        transition={{
                            x: {
                                type: "spring",
                                stiffness: 500,
                                damping: 10,
                            },
                            scale: {
                                type: "tween",
                                duration: 0.375

                            }
                        }}
                    >
                        <div className="flex flex-col items-center font-logo">
                            <Link to={`/profile/${user.username}`} className="transition-color duration-300 p-2.5 hover:bg-gray-300/20 rounded-lg w-full text-white text-xl">
                                Profile
                            </Link>
                            <button
                                className="text-left transition-color duration-300 p-2.5 hover:bg-gray-300/20 rounded-lg w-full text-white text-xl"
                                onClick={handleSignOut}
                            >
                                Sign Out
                            </button>
                        </div>

                    </m.ul>
                )}
            </AnimatePresence>

        </div>
    )
}