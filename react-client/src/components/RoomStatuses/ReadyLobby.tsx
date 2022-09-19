import { arrayRemove, deleteDoc, doc, updateDoc } from "firebase/firestore/lite";
import { AnimatePresence, LayoutGroup, m } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { BiLoader } from "react-icons/bi";
import { BsCheckLg, BsFillChatFill } from "react-icons/bs";
import { FaCrown } from "react-icons/fa";
import { FiShare } from "react-icons/fi";
import { Link } from "react-router-dom";
import { RWebShare } from "react-web-share";
import { CgGames } from "react-icons/cg";
import { AiFillDelete } from "react-icons/ai";
import { loadFirestore } from "../../utils/firebase";
import { IoIosArrowBack } from "react-icons/io";
import MessageButton from "../MessageUI/components/MessageButton";
import { Helmet } from "react-helmet";





export default function RoomLobby({ id, uid, players, }: { id: string, uid: string, players: GamePlayer[] }) {
  const [ready, setReady] = useState(false);
  const [isShownID, setIsShownID] = useState<string | undefined>("")
  const currentPlayer = useMemo(() => players.find(p => p.uid === uid), [players, uid]);


  useEffect(() => {
    const main = async () => {


      const firestore = await loadFirestore()
      updateDoc(doc(firestore, "rooms", id, "players", uid), { ready: ready });
    }
    main();
  }, [ready]);

  async function deleteUser(uid: string | undefined) {
    if (!uid) return
    const player = players.find(p => p.uid === uid)
    if (window.confirm(`Are you Sure You want to remove "${player?.name}"`)) {
      const firestore = await loadFirestore()
      await Promise.all([
        deleteDoc(doc(firestore, "rooms", id, "players", uid)),
        updateDoc(doc(firestore, "rooms", id), {
          players: arrayRemove(uid),
          usernames: arrayRemove(player?.name)
        })
      ])
    }
  }

  const formatter = new Intl.NumberFormat("en", { notation: "compact", minimumFractionDigits: 0, maximumFractionDigits: 2 })
  return (
    <>
      <Helmet>
        <title>Neo Letter | Ready {id}</title>
      </Helmet>
      <LayoutGroup>
        <div className="min-h-screen w-screen flex justify-center items-center">
          <m.div className="flex flex-col  item-center  w-fullmax-w-[22rem] xs:max-w-[24rem] sm:max-w-xl main-container py-7"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            layout
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
          >
            <div className="flex items-start absolute w-full">
              <button className=" ml-3 p-2 rounded-full hover:bg-white/10 hover:scale-105 active:scale-95 transition-all duration-300">
                <Link to="/">
                  <IoIosArrowBack size={35} />
                </Link>
              </button>
            </div>
            <div className="flex flex-col items-center mb-5 col-span-6">
              <h1 className="text-4xl font-logo">Ready Up</h1>
              <h2 className="mt-3 text-xl font-sans font-semibold">Room: {id}</h2>
            </div>

            <div className=" flex flex-col gap-5 overflow-y-scroll scroll-lobby shadow-input-inner h-56  rounded-xl ">
              {[currentPlayer, ...players.filter(player => player.uid !== currentPlayer?.uid)].map((player, i) => <m.div
                key={player?.uid}
                className="flex items-center group"
                onMouseEnter={() => setIsShownID(player?.uid)}
                onMouseLeave={() => setIsShownID("")}
                initial={{ opacity: 0, y: -20, }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  delay: i * 0.25 + 0.5
                }}
              >
                <AnimatePresence>
                  {currentPlayer?.role === "creator" && player?.uid !== uid && isShownID === player?.uid &&
                    <m.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                        duration: .5
                      }}
                      className="absolute w-full flex items-center justify-center"
                    >
                      <button onClick={() => deleteUser(player?.uid)} className="btn btn-ghost tooltip tooltip-top tooltip-error" data-tip="Delete">
                        <AiFillDelete className="text-red-500" size={40} />
                      </button>
                    </m.div>}
                </AnimatePresence>

                <div
                  className={`flex shadow-input mx-3 groups rounded-xl p-3 sm:p-5 w-full items-center ${currentPlayer?.role === "creator" && player?.uid !== uid && "group-hover:bg-red-500/40 transition-all duration-500"}`}

                >

                  <div className="grid grid-cols-2 items-center w-full  ">
                    <div className="flex justify-start items-center ">
                      <p className="font-logo text-3xl">{player?.name}</p>
                      {player?.signedIn && (
                        <>
                          <div className="flex items-center ml-1.5 sm:ml-3 gap-0.5 sm:gap-1">
                            <FaCrown className="text-yellow-500" aria-label="Games won" size={25} /> <span className="font-semibold text-xl">{formatter.format(player.wins as number)}</span>
                          </div>
                          <div className="flex items-center gap-0.5 ml-3 sm:gap-1">
                            <CgGames className="text-blue-500" aria-label="Games played" size={25} /> <span className="font-semibold text-xl">{formatter.format(player.gamesPlayed as number)}</span>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex justify-end w-full">
                      <AnimatePresence exitBeforeEnter>
                        {player?.ready ?
                          <m.div
                            key="ready"
                            initial={{ scale: 0, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{
                              scale: {
                                type: "spring",
                                stiffness: 300,
                                damping: 10
                              },
                              y: {
                                type: "spring",
                                stiffness: 250,
                                damping: 10
                              },
                            }}>
                            <BsCheckLg className="text-green-500 text-4xl" />
                          </m.div> :
                          <m.div
                            key="unready"
                            initial={{ scale: 0, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{
                              scale: {
                                type: "spring",
                                stiffness: 300,
                                damping: 10
                              },
                              y: {
                                type: "spring",
                                stiffness: 250,
                                damping: 10
                              },
                            }}>
                            <BiLoader className="text-white text-4xl animate-spin ease-in" />
                          </m.div>
                        }
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </m.div>
              )}
            </div>
            <div className="grid grid-cols-5 items-center mt-5 w-full">
              <div className="ml-3">
                <MessageButton />
              </div>
              <div className="col-span-3 flex justify-center">
                <button className={`btn transition-all shadow-xl ${!ready ? "btn-success shadow-success/50" : " btn-error shadow-error/50"} w-[12.5rem]  sm:w-80 text-white`} onClick={() => setReady(!ready)}>
                  {ready ? 'Unready' : 'Ready'}
                </button>
              </div>
              <div className="flex justify-end mr-3 tooltip tooltip-bottom" data-tip="Share?">
                <RWebShare
                  data={{
                    title: `Join room ${id}`,
                    text: `${currentPlayer?.name} sent you a request to join room ${id}`,
                    url: `${import.meta.env.DEV ? `http://localhost:3000/join?id=${id}` : `https://neo-letter.web.app/join?id=${id}`}`,
                  }}>
                  <button className=" transition-all duration-300 flex justify-center  items-center rounded-full p-3 bg-primary text-white active:scale-90">
                    <FiShare size={25} />
                  </button>
                </RWebShare>
              </div>
            </div>
          </m.div>
        </div>
      </LayoutGroup>
    </>
  )
}
