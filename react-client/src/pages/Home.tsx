import { doc, setDoc } from 'firebase/firestore';
import { useContext, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import MobileImage from "/images/assets/App-Mobile.webp"
import DesktopImage from "/images/assets/App-Desktop.webp"
import { motion } from 'framer-motion';
import { useWindowSize } from 'react-use';



function Home() {
    const id = useContext(AuthContext)
    const [hasVisited, setHasVisited] = useState(false)
    const { width } = useWindowSize()

    console.log(process.env.VITTE_TEST)

    //see if the user has already been to this page with a cookie
    useEffect(() => {
        if (document.cookie.includes("hasVisited")) {
            setHasVisited(true)
        } else {
            // document.cookie = "hasVisited=true"
            setHasVisited(false)
        }
    }, [])


    return (
        <>
            <Helmet>
                <title>Neo Letter | Home page</title>
                <meta name="description" content="The new wordle party game to play with your friends" />
                <meta property="og:url" content="https://neo-letter.web.app/" />
                <meta property="og:type" content="website" />
                <meta property="og:title" content="Neo Letter" />
                <meta
                    property="og:description"
                    content="A new wordle party game to play with your friends"
                />
                <meta property="og:image" content="/images/preview/Home.png" />
            </Helmet>
            <div className="hero min-h-screen"
                style={{
                    backgroundImage: `url(${width > 768 ? DesktopImage : MobileImage})`,
                    backgroundSize: "cover",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center"
                }}
            >
                <div className="hero-content text-center text-neutral-content">
                    <motion.div className=" max-w-md sm:max-w-xl  rounded-xl p-5 glass-container shadow-2xl"
                        initial={{ rotateX: -90, opacity: 0 }}
                        animate={{ rotateX: 0, opacity: 1 }}
                        transition={{
                            type: "spring",
                            stiffness: 100,
                            damping: 20,
                            mass: 1,
                            duration: 0.5
                        }}>
                        <div className='flex justify-center'>
                            <div className=' bg-gray-700 text-5xl sm:text-6xl text-white font-logo px-4 -skew-x-12 rounded-2xl mb-5'>
                                <div className='flex items-center'>
                                    <motion.div
                                        className='p-1  skew-x-[-12deg] rounded'
                                        initial={{ scale: 2, zIndex: 100, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{
                                            type: "spring",
                                            delay: 1,
                                            duration: .5
                                        }}>The</motion.div>
                                    <motion.button
                                        className='bg-success skew-x-[-12deg] rounded'
                                        initial={{ scale: 3, zIndex: 100, opacity: 0 }}
                                        animate={{ scale: [1, .75, 1], opacity: 1 }}
                                        transition={{
                                            scale: {
                                                type: "spring",
                                                delay: 1.5,
                                                duration: .5,
                                            },
                                            opacity: {
                                                delay: 1.5,
                                                duration: .25,
                                            },
                                            rotateX: {
                                                type: "inertia",
                                                velocity: 1250,
                                                delay: 0

                                            }
                                        }}
                                        whileTap={{
                                            rotateX: [0, -90, 0],
                                        }}
                                    >Wordle</motion.button>
                                </div>
                                <div className='flex items-center '>
                                    <motion.button className='bg-warning skew-x-[-12deg] rounded'
                                        initial={{ scale: 4, zIndex: 100, opacity: 0 }}
                                        animate={{ scale: [1, .7, 1], z: 0, opacity: 1 }}
                                        transition={{
                                            scale: {
                                                type: "spring",
                                                delay: 2,
                                                duration: .5,
                                            },
                                            opacity: {
                                                delay: 2,
                                                duration: .25,
                                            },
                                            rotateX: {
                                                type: "inertia",
                                                velocity: 1250,
                                                delay: 0

                                            }
                                        }}
                                        whileTap={{
                                            rotateX: [0, -270, 0],
                                        }}
                                    >Party</motion.button>
                                    <motion.div className='p-1 skew-x-[-12deg] rounded'
                                        initial={{ scale: 5, zIndex: 100, opacity: 0 }}
                                        animate={{ scale: [1, .65, 1], z: 0, opacity: 1 }}
                                        transition={{
                                            type: "spring",
                                            delay: 2.5,
                                            duration: .5
                                        }}
                                    >Game</motion.div>
                                </div>
                            </div>
                        </div>
                        <p className="mb-5 text-base">
                            <a className='font-black text-xl' >Neo Letter</a> is the new wordle party game to play with your friends.
                            You can create, limit, and choose who can play with you.
                            With <a className='font-black text-xl'>Mobile</a> first, <a className='font-black text-xl'>Everyone</a> can play.
                        </p>
                        <div className='flex justify-center gap-5 sm:gap-10'>
                            <Link to="/join">
                                <button className=" text-white transition-all flex items-center py-4 px-7 text-xl font-logo hover:bg-gray-400/25  rounded-xl active:scale-95">
                                    Join
                                </button>

                            </Link>
                            <Link to="/create">
                                <button className="transition-all text-white flex items-center py-4 px-7 text-xl font-logo bg-primary hover:bg-red-400 active:bg-red-600 rounded-xl active:scale-95">
                                    Create
                                </button>
                            </Link>

                        </div>

                    </motion.div>
                </div>
            </div >
        </>
    )
}

export default Home