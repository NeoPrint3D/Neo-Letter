import { arrayRemove, deleteDoc, doc, updateDoc } from "firebase/firestore/lite";
import { AnimatePresence, LayoutGroup, m } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { BiArrowBack, BiLoader } from "react-icons/bi";
import { BsCheckLg } from "react-icons/bs";
import { FaCrown } from "react-icons/fa";
import { FiShare } from "react-icons/fi";
import { Link } from "react-router-dom";
import { RWebShare } from "react-web-share";
import { CgGames } from "react-icons/cg";
import { AiFillDelete } from "react-icons/ai";
import { app, firestore } from "../../utils/firebase";





export default function RoomLobby({ id, uid, players, }: { id: string, uid: string, players: GamePlayer[] }) {
  const [ready, setReady] = useState(false);
  const [isShown, setIsShown] = useState(false)
  const currentPlayer = useMemo(() => players.find(p => p.uid === uid), [players, uid]);


  useEffect(() => {
    const main = async () => {
      updateDoc(doc(firestore, "rooms", id, "players", uid), { ready: ready });
    }
    main();
  }, [ready]);

  async function deleteUser(uid: string) {
    const player = players.find(p => p.uid === uid)
    if (window.confirm(`Are you Sure You want to remove "${player?.name}"`)) {
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
    <LayoutGroup>
      <div className="min-h-screen w-screen flex justify-center items-center">
        <m.div className="flex flex-col justify-center w-full max-w-sm  sm:max-w-xl px-5 main-container py-10"
          layout
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 1
          }}>
          <div className="grid grid-cols-8">
            <div className="mt-3">
              <Link to="/">
                <BiArrowBack size={30} className=" text-white" />
              </Link>
            </div>

            <div className="flex flex-col items-center mb-5 col-span-6">
              <h1 className="text-4xl font-logo">Ready Up</h1>
              <h2 className="mt-3 text-xl font-sans font-semibold">Room: {id}</h2>
            </div>
            <div>
              <div className="tooltip" data-tip={"Share?"}>
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
          </div>
          <div className=" flex flex-col gap-5 overflow-y-scroll scroll-lobby shadow-input-inner h-56  rounded-xl p-5 ">

            {players.map((player, i) =>
              <m.div key={player.uid}
                className={`flex shadow-input group rounded-xl p-3 sm:p-5 items-center ${currentPlayer?.role === "creator" && player.uid !== uid && "hover:bg-red-500/40 transition-all duration-500"}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 50,
                  damping: 10,
                  delay: i * 0.25
                }}
                onMouseEnter={() => setIsShown(true)}
                onMouseLeave={() => setIsShown(false)}
              >
                <div className="flex justify-center w-full items-center">

                  <AnimatePresence>
                    {currentPlayer?.role === "creator" && player.uid !== uid && isShown &&
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
                        className="absolute w-full flex justify-center"
                      >
                        <button onClick={() => deleteUser(player.uid)} className="btn btn-ghost tooltip tooltip-top tooltip-error" data-tip="Delete">
                          <AiFillDelete className="text-red-500" size={40} />
                        </button>
                      </m.div>
                    }
                  </AnimatePresence>
                  <div className="flex justify-start items-center w-full ">
                    <p className="font-logo text-3xl">{player.name}</p>
                    {player.signedIn && (
                      <>
                        <div className="flex items-center gap-1 ml-3">
                          <FaCrown className="text-yellow-500" aria-label="Games won" size={25} /> <span className="font-semibold text-xl">{formatter.format(player.wins as number)}</span>
                        </div><div className="flex items-center gap-1 ml-3">
                          <CgGames className="text-blue-500" aria-label="Games played" size={25} /> <span className="font-semibold text-xl">{formatter.format(player.gamesPlayed as number)}</span>
                        </div>
                      </>
                    )}
                  </div>
                  <AnimatePresence>
                    {player.ready ?
                      <m.div
                        initial={{ scale: 0, y: -20 }}
                        animate={{ scale: 1, y: 0 }}
                        transition={{
                          scale: {
                            type: "spring",
                            stiffness: 250,
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
                      <BiLoader className="text-white text-4xl animate-spin ease-in" />
                    }
                  </AnimatePresence>

                </div>
              </m.div>
            )}
          </div>
          <div className="flex justify-center mt-5">
            <button className="   btn btn-success w-40  sm:w-80" onClick={() => setReady(!ready)}>
              Ready
            </button>
          </div>
        </m.div>
      </div>
    </LayoutGroup>
  )
}
