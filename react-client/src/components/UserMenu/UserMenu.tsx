import { AnimatePresence, domAnimation, LazyMotion, m } from "framer-motion"
import { useCallback, useContext, useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { UserContext } from "../../context/AuthContext"


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



    useEffect(() => {
        setOpen(false)
    }, [location.pathname])


    return (
        <div className="flex flex-col items-end  absolute top-0 right-0 mt-2 mr-2"
            tabIndex={0}
            onBlur={(e) => handleBlur(e)}
        >
            <AnimatePresence>
                {!location.pathname.includes("profile") &&
                    <>
                        <m.button
                            onClick={() => setOpen(!open)}

                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 30,
                                duration: 3
                            }}

                        >
                            <div className=" flex justify-center items-center  border-4 border-transparent hover:border-white/70 duration-500 transition-colors h-16 w-16  rounded-full">
                                <img src={user?.profilePic} alt="user" className={`rounded-full h-14 w-14 `} referrerPolicy="no-referrer" />
                            </div>
                        </m.button>
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
                                        <Link
                                            to={"/signup?action=signout"}
                                            className="text-left transition-color duration-300 p-2.5 hover:bg-gray-300/20 rounded-lg w-full text-white text-xl"
                                        >
                                            Sign Out
                                        </Link>
                                    </div>

                                </m.ul>
                            )}
                        </AnimatePresence>
                    </>
                }
            </AnimatePresence>
        </div >
    )
}